import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { VoteType } from '@/types/fixed';
import { voteOnAgentVersion } from '@/lib/agents/vote';
import { AgentVoteStats } from '@/lib/agents/voting/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, HeartOff, MessageSquare } from 'lucide-react';

// Helper function to safely handle tenant IDs
export const ensureStringTenantId = (tenantId: string | null): string => {
  if (!tenantId) {
    throw new Error('Tenant ID is required but was not provided');
  }
  return tenantId;
};

interface AgentVersion {
  id: string;
  version_number: string;
  upvotes: number;
  downvotes: number;
  xp: number;
  created_at: string;
  description: string;
  metadata: any;
}

const PluginEvolution: React.FC = () => {
  const { pluginId } = useParams<{ pluginId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [agentVersions, setAgentVersions] = useState<AgentVersion[]>([]);
  const [voteStats, setVoteStats] = useState<Record<string, AgentVoteStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (pluginId && user?.id) {
      fetchData(pluginId, user.id);
    }
  }, [pluginId, user?.id]);

  const fetchData = async (pluginId: string, userId: string) => {
    setLoading(true);
    try {
      // Fetch the current tenant ID
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id')
        .eq('user_id', userId)
        .single();

      if (tenantError) {
        throw new Error(`Error fetching tenant ID: ${tenantError.message}`);
      }

      const tenantId = tenantData?.tenant_id;

      if (!tenantId) {
        throw new Error('Tenant ID not found for the current user');
      }

      await fetchAgentVersions(ensureStringTenantId(tenantId), pluginId);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentVersions = async (tenantId: string, pluginId: string) => {
    try {
      const { data, error } = await supabase
        .from('agent_versions')
        .select('*')
        .eq('plugin_id', pluginId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching agent versions: ${error.message}`);
      }

      if (data) {
        setAgentVersions(data);
        await fetchVoteStats(data, tenantId, user?.id || '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch agent versions');
      console.error('Error fetching agent versions:', err);
    }
  };

  const fetchVoteStats = async (versions: AgentVersion[], tenantId: string, userId: string) => {
    const stats: Record<string, AgentVoteStats> = {};

    for (const version of versions) {
      const { data: voteData, error: voteError } = await supabase
        .from('agent_votes')
        .select('id, vote_type, comment')
        .eq('agent_version_id', version.id)
        .eq('user_id', userId)
        .single();

      if (voteError && voteError.code !== 'PGRST116') {
        console.error('Error fetching user vote:', voteError);
      }

      stats[version.id] = {
        agentVersionId: version.id,
        upvotes: version.upvotes || 0,
        downvotes: version.downvotes || 0,
        xp: version.xp || 0,
        totalVotes: (version.upvotes || 0) + (version.downvotes || 0),
        userVote: voteData
          ? {
              id: voteData.id,
              voteType: voteData.vote_type,
              comment: voteData.comment,
            }
          : undefined,
      };
    }

    setVoteStats(stats);
  };

  const handleVote = async (versionId: string, voteType: VoteType) => {
    if (!user?.id) {
      toast({
        title: 'Not authenticated',
        description: 'You must be logged in to vote.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Fetch the current tenant ID
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (tenantError) {
        throw new Error(`Error fetching tenant ID: ${tenantError.message}`);
      }

      const tenantId = tenantData?.tenant_id;

      if (!tenantId) {
        throw new Error('Tenant ID not found for the current user');
      }

      const result = await voteOnAgentVersion(versionId, voteType, user.id, ensureStringTenantId(tenantId), comment);

      if (result.success) {
        toast({
          title: 'Vote recorded',
          description: `You have ${voteType}voted this version.`,
        });

        // Optimistically update the vote stats
        setVoteStats((prevStats) => {
          const newStats = { ...prevStats };
          const oldStats = newStats[versionId] || { upvotes: 0, downvotes: 0, xp: 0, totalVotes: 0 };

          // Adjust the counts based on the vote type
          const upvotes = voteType === VoteType.up ? oldStats.upvotes + 1 : Math.max(0, oldStats.upvotes + (voteType === VoteType.down ? -1 : 0));
          const downvotes = voteType === VoteType.down ? oldStats.downvotes + 1 : Math.max(0, oldStats.downvotes + (voteType === VoteType.up ? -1 : 0));
          const xp = oldStats.xp + (voteType === VoteType.up ? 10 : -5);
          const totalVotes = upvotes + downvotes;

          newStats[versionId] = {
            ...oldStats,
            upvotes: upvotes,
            downvotes: downvotes,
            xp: xp,
            totalVotes: totalVotes,
            userVote: {
              id: result.voteId || '',
              voteType: voteType,
            },
          };

          return newStats;
        });
      } else {
        toast({
          title: 'Vote failed',
          description: result.error || 'Failed to record vote.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Unexpected error',
        description: err.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      console.error('Error during voting:', err);
    }
  };

  const handleRemoveVote = async (versionId: string) => {
    if (!user?.id) {
      toast({
        title: 'Not authenticated',
        description: 'You must be logged in to remove your vote.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Fetch the current tenant ID
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_user_roles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (tenantError) {
        throw new Error(`Error fetching tenant ID: ${tenantError.message}`);
      }

      const tenantId = tenantData?.tenant_id;

      if (!tenantId) {
        throw new Error('Tenant ID not found for the current user');
      }

      // Get the current vote
      const currentVote = voteStats[versionId]?.userVote;

      if (!currentVote) {
        toast({
          title: 'No vote found',
          description: 'You have not voted on this version.',
          variant: 'destructive',
        });
        return;
      }

      // Remove the vote
      const { error: deleteError } = await supabase
        .from('agent_votes')
        .delete()
        .eq('id', currentVote.id);

      if (deleteError) {
        throw new Error(`Error deleting vote: ${deleteError.message}`);
      }

      // Update the upvote/downvote count on the agent version
      const updateField = currentVote.voteType === VoteType.up ? 'upvotes' : 'downvotes';

      const { error: updateError } = await supabase
        .from('agent_versions')
        .update({
          [updateField]: supabase.rpc('increment', {
            value: -1
          }),
          xp: supabase.rpc('increment', {
            value: currentVote.voteType === VoteType.up ? -10 : 5
          })
        })
        .eq('id', versionId);

      if (updateError) {
        console.error('Error updating agent version counts:', updateError);
        toast({
          title: 'Vote removed but failed to update counts',
          description: `Vote removed but failed to update counts: ${updateError.message}`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Vote removed',
        description: 'Your vote has been successfully removed.',
      });

      // Optimistically update the vote stats
      setVoteStats((prevStats) => {
        const newStats = { ...prevStats };
        const oldStats = newStats[versionId] || { upvotes: 0, downvotes: 0, xp: 0, totalVotes: 0 };

        // Adjust the counts based on the vote type
        const upvotes = currentVote.voteType === VoteType.up ? Math.max(0, oldStats.upvotes - 1) : oldStats.upvotes;
        const downvotes = currentVote.voteType === VoteType.down ? Math.max(0, oldStats.downvotes - 1) : oldStats.downvotes;
        const xp = oldStats.xp + (currentVote.voteType === VoteType.up ? -10 : 5);
        const totalVotes = upvotes + downvotes;

        newStats[versionId] = {
          ...oldStats,
          upvotes: upvotes,
          downvotes: downvotes,
          xp: xp,
          totalVotes: totalVotes,
          userVote: undefined,
        };

        return newStats;
      });
    } catch (err: any) {
      toast({
        title: 'Unexpected error',
        description: err.message || 'An unexpected error occurred while removing your vote.',
        variant: 'destructive',
      });
      console.error('Error during vote removal:', err);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Plugin Evolution</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {agentVersions.map((version) => (
        <Card key={version.id} className="mb-4">
          <CardHeader>
            <CardTitle>Version {version.version_number}</CardTitle>
            <CardDescription>{version.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={`https://avatar.vercel.sh/${version.id}.png`} />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-gray-500">Created at: {new Date(version.created_at).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">XP: {voteStats[version.id]?.xp || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  <Heart className="mr-2 h-4 w-4" />
                  {voteStats[version.id]?.upvotes || 0}
                </Badge>
                <Badge variant="outline">
                  <HeartOff className="mr-2 h-4 w-4" />
                  {voteStats[version.id]?.downvotes || 0}
                </Badge>
              </div>
              <div className="mt-2">
                {voteStats[version.id]?.userVote ? (
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveVote(version.id)}>
                    Remove Vote
                  </Button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleVote(version.id, VoteType.up)}>
                      Upvote
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleVote(version.id, VoteType.down)}>
                      Downvote
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4">
              <Textarea
                placeholder="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PluginEvolution;

import React from 'react';

export const sidebarSections = [
	{
		label: 'Admin',
		links: [
			{ name: 'Agent Versions', href: '/admin/agents' },
			{ name: 'Multi-Agent Voting', href: '/admin/MultiAgentVoting' },
			{ name: 'AI Decisions', href: '/admin/ai-decisions' },
			{ name: 'Inspector Chat', href: '/admin/inspector' },
			{ name: 'KPI Alerts', href: '/admin/KPIAlertsPage' },
			{ name: 'System Logs', href: '/admin/LogsPage' },
		],
	},
	// ...other sections...
];

function Sidebar() {
	// ...your sidebar rendering logic, e.g. mapping over sidebarSections...
}

export default Sidebar;
using System.Windows;

namespace SystemLogsApp.LogDetailDialog
{
    public partial class LogDetailDialog : Window
    {
        public LogDetailDialog()
        {
            InitializeComponent();
        }

        public void LoadLogDetails(string logDetails)
        {
            // Logic to display log details in the dialog
            LogDetailsTextBox.Text = logDetails;
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            this.Close();
        }
    }
}
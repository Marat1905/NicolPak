namespace BdmService.Services.Implementations.Model
{
    public class Read
    {
        public int PrintSendStatus { get; set; }

        public int PrintStatus { get; set; }

        public override string ToString()
        {
            return $"PrintSendStatus: {PrintSendStatus} ; \t PrintStatus: {PrintStatus};";
        }
    }
}

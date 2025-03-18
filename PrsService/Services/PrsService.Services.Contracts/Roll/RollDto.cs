using PrsService.Services.Contracts.Production;

namespace PrsService.Services.Contracts.Roll
{
    public class RollDto
    {
        /// <summary>Идентификатор</summary>
        public Guid Id { get; set; }

        /// <summary>Идентификатор переданный из ПЛК</summary>
        public int RollID { get; set; }

        /// <summary>Ширина рулона </summary>
        public double RollWidth { get; set; }

        public ProductionDto? Production { get; set; }
    }
}

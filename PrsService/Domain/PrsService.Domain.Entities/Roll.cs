// Ignore Spelling: Prs

using GM.EFCore.Entities.Base;

namespace PrsService.Domain.Entities
{
    public class Roll<TKey>: Entity<TKey>
    {
        /// <summary>Идентификатор переданный из ПЛК</summary>
        public int IdIntRoll { get; set; }

        /// <summary>Ширина рулона </summary>
        public double Width { get; set; }

        public  TKey? ProductionId { get; set; }

        public  Production? Production { get; set; }
    }
    public class Roll : Roll<Guid> { }
}

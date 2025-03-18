namespace PrsService.Services.Contracts.Roll
{

    public class CreatingRollDto
    {
        /// <summary>Идентификатор рулона с контроллера</summary>
        public int RollId { get; set; }

        /// <summary>Ширина рулона</summary>
        public double RollWidth { get; set; }

        /// <summary>Время создания продукта</summary>
        public DateTime CreateAt { get; set; } = DateTime.Now;
    }
}

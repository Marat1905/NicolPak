namespace PrsService.Services.Contracts.TamburPrs
{
    public class CreatingTamburDto
    {
        /// <summary>Порядковый номер тамбура</summary>
        public int TamburContPrs { get; set; }

        /// <summary>Создание тамбура</summary>
        public DateTime CreateAt { get; set; } = DateTime.Now;
    }
}

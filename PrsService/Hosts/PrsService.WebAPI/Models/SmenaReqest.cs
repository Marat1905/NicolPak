using PrsService.WebAPI.Enums;
using System.ComponentModel.DataAnnotations;

namespace PrsService.WebAPI.Models
{
    /// <summary>Для запроса по сменам </summary>
    public class SmenaReqest
    {
        /// <summary>Выбор смены </summary>
        [Required]
         public Smena Shift { get; set; }

        /// <summary>Дата</summary>
        ///<example>2025-03-18</example>
        [Required]
        [DataType(DataType.Date)]
        public DateOnly Date { get; set; }
    }
}

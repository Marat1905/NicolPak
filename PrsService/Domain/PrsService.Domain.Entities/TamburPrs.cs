// Ignore Spelling: Tambur Prs

using GM.EFCore.Entities.Base;

namespace PrsService.Domain.Entities
{
    /// <summary> Тамбур поставленный на ПРС</summary>
    /// <typeparam name="TKey">Тип первичного ключа</typeparam>
    public class TamburPrs<TKey>: TimedEntity<TKey>
    {
        /// <summary>Время снятия тамбура </summary>
        public DateTime? End {  get; set; }

        /// <summary>Порядковый номер тамбура тамбура</summary>
        public int TamburContPrs { get; set; }
        public virtual ICollection<Production>? Productions { get; set; }
    }

    /// <summary><inheritdoc/> </summary>
    public class TamburPrs : TamburPrs<Guid> { }
}

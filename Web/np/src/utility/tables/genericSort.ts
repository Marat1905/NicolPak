import ISorter from "../../interface/Tables/ISorter";

// функция сравнения для любого свойства в типе T
// работает для: строк, чисел и дат (и типизирована для принятия только свойств этих типов)
// может быть расширена для других типов, но здесь потребуется некоторая пользовательская функция сравнения
export function genericSort<T>(
    objectA: T,
    objectB: T,
    sorter: ISorter<T>
) {
    const result = () => {
        if (objectA[sorter.property] > objectB[sorter.property]) {
            return 1;
        } else if (objectA[sorter.property] < objectB[sorter.property]) {
            return -1;
        } else {
            return 0;
        }
    }

    return sorter.isDescending ? result() * -1 : result();
}
import IFilter from "../../interface/Tables/IFilter";

// фильтрация n свойств на истинность или ложность значений для типа T (без эффекта, если фильтр не выбран)
export function genericFilter<T>(object: T, filters: Array<IFilter<T>>) {
    // no filters; no effect - return true
    if (filters.length === 0) {
        return true;
    }

    return filters.every((filter) => {
        return filter.isTruthyPicked ? object[filter.property] : !object[filter.property];
    });
}
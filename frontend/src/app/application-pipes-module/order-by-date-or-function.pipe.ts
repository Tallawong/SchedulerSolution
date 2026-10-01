import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderByDateOrFunction',
  standalone: true,
})
export class OrderByDateOrFunctionPipe implements PipeTransform {
  transform<T extends object>(array: T[], property: string, order: 'asc' | 'desc'): T[] {
    if (!Array.isArray(array) || !property) {
      return array;
    }

    // Use index signatures
    if (property == 'date') {
      array.sort((a, b) => {
        const dateA = new Date(String((a as Record<string, unknown>)[property]));
        const dateB = new Date(String((b as Record<string, unknown>)[property]));
        if (order === 'asc') {
          return dateA.getTime() - dateB.getTime();
        } else {
          return dateB.getTime() - dateA.getTime();
        }
      });
      return array;
    } else if (property === 'userFunction') {
      array.sort((a, b) => {
        const valueA = String((a as Record<string, unknown>)[property]);
        const valueB = String((b as Record<string, unknown>)[property]);
        if (order === 'asc') {
          if (valueA > valueB) return 1;
          if (valueA < valueB) return -1;
          return 0;
        } else {
          if (valueA < valueB) return 1;
          if (valueA > valueB) return -1;
          return 0;
        }
      });
      return array;
    } else {
      return array;
    }
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'coordinateFormat'
})
export class CoordinateFormatPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}

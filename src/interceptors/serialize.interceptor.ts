import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { plainToClass } from 'class-transformer'
// import { nextTick } from 'process'

interface ClassConstructor {
  new (...args: any[]): {}
}
export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto))
}


export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  intercept (context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      // taking the incoming user entity 'data''
      // and turn it into an instance of dto
      map((data: any) => {
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        })
      }),
    )
  }
}

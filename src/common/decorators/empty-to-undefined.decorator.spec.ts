import { plainToClass } from 'class-transformer';
import { EmptyToUndefined } from './empty-to-undefined.decorator';

class TestDto {
  @EmptyToUndefined()
  value?: string;
}

describe('EmptyToUndefined decorator', () => {
  it('should transform empty string to undefined', () => {
    const dto = plainToClass(TestDto, { value: '' });
    expect(dto.value).toBeUndefined();
  });

  it('should transform string with only spaces to undefined', () => {
    const dto = plainToClass(TestDto, { value: '   ' });
    expect(dto.value).toBeUndefined();
  });

  it('should keep a non-empty string as is', () => {
    const dto = plainToClass(TestDto, { value: 'hello' });
    expect(dto.value).toBe('hello');
  });

  it('should remove leading and trailing spaces', () => {
    const dto = plainToClass(TestDto, { value: '  hello  ' });
    expect(dto.value).toBe('hello');
  });

  it('should keep undefined as undefined', () => {
    const dto = plainToClass(TestDto, { value: undefined });
    expect(dto.value).toBeUndefined();
  });

  it('should keep null as null', () => {
    const dto = plainToClass(TestDto, { value: null });
    expect(dto.value).toBeNull();
  });
});

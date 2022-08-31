import {
  FilterRunner,
  FilterRunnerTransformOptions,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import { PARAMETERIZER_VAR_NAME, SANITIZER_NAME } from './constants';
import { Parameterizer } from './parameterizer';
import { TemplateInput } from './templateInput';

@VulcanInternalExtension()
export class SanitizerRunner extends FilterRunner {
  public filterName = SANITIZER_NAME;

  public async transform({
    value,
    context,
  }: FilterRunnerTransformOptions): Promise<any> {
    let input: TemplateInput;
    // Wrap the value to template input to parameterized
    if (value instanceof TemplateInput) input = value;
    else {
      input = new TemplateInput(value);
    }
    // Parameterizer should be set by req tag runner
    const parameterizer = context.lookup<Parameterizer>(PARAMETERIZER_VAR_NAME);
    if (!parameterizer) throw new Error(`No parameterizer found`);
    return await input.parameterize(parameterizer);
  }
}

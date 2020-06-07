import LaboratoryTestkit from '@wix/wix-experiments/dist/src/laboratory-testkit';
import { ExperimentsBag } from '@wix/wix-experiments';

export default function (scope: string, experiments: ExperimentsBag) {
  new LaboratoryTestkit()
    .withScope(scope)
    .withBaseUrl('https://www.wix.com')
    .withExperiments(experiments)
    .start();
}

import { RawSchema } from '../schemas/utils';
import {
  Macro,
  Model,
  Enum,
  Relation,
  Metric,
  View,
  Config,
  MacroJSON,
  ModelJSON,
  RelationJSON,
  MetricJSON,
  EnumValueJson,
  ViewJSONRow,
} from '../schemas';
import { Jsonable } from '../schemas/interface/jsonable';

export interface SemanticJSON {
  models: ModelJSON[];
  relationships: RelationJSON[];
  metrics: MetricJSON[];
  enumDefinitions: EnumValueJson[];
  views: ViewJSONRow[];
  macros: MacroJSON[];
  catalog: string;
  schema: string;
}
export class Semantic implements Jsonable {
  public enumLayers: Enum[] = [];
  public modelLayers: Model[] = [];
  public relationLayers: Relation[] = [];
  public metricLayers: Metric[] = [];
  public view: View | null = null;
  public macroLayers: Macro[] = [];
  public config: Config = new Config({
    name: 'config',
    reserved: 'config',
    decorators: [],
    body: [],
  });

  constructor(schemas: RawSchema[]) {
    for (const schema of schemas) {
      switch (schema.reserved) {
        case 'model':
          this.modelLayers.push(new Model(schema));
          break;
        case 'enum':
          this.enumLayers.push(new Enum(schema));
          break;
        case 'relation':
          this.relationLayers.push(new Relation(schema));
          break;
        case 'metric':
          this.metricLayers.push(new Metric(schema));
          break;
        case 'config':
          this.config = new Config(schema);
          break;
        case 'view':
          this.view = new View(schema);
          break;
        case 'macro':
          this.macroLayers.push(new Macro(schema));
          break;
        default:
          throw new Error(`Unknown reserved word: ${schema.reserved}`);
      }
    }
  }

  public toJSON() {
    const json = {
      models: this.modelLayers.map((model) => model.toJSON()),
      relationships: this.relationLayers.map((relation) => relation.toJSON()),
      metrics: this.metricLayers.map((metric) => metric.toJSON()),
      enumDefinitions: this.enumLayers.map((enumLayer) => enumLayer.toJSON()),
      views: this.view ? this.view.toJSON() : [],
      macros: this.macroLayers.map((macro) => macro.toJSON()),
    };

    const configData = {
      catalog: '',
      schema: '',
    };
    if (this.config) {
      configData.catalog = this.config.get('project');
      configData.schema = this.config.get('schema');
    }

    return {
      ...configData,
      ...json,
    };
  }
}

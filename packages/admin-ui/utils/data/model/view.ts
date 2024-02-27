import { v4 as uuidv4 } from 'uuid';
import { NODE_TYPE } from '@vulcan-sql/admin-ui/utils/enum';
import { View, ViewColumn } from '@vulcan-sql/admin-ui/utils/data/type';

export class ViewData {
  public readonly nodeType: NODE_TYPE = NODE_TYPE.VIEW;

  public readonly id: string;
  public readonly name: string;
  public readonly statement: string;
  public readonly cached: boolean;
  public readonly refreshTime: string;
  public readonly properties: View['properties'];

  public readonly fields: ViewColumnData[];

  constructor(view: View) {
    this.id = uuidv4();
    this.name = view.name;
    this.statement = view.statement;
    this.cached = view.cached;
    this.refreshTime = view.refreshTime;
    this.properties = view.properties;

    this.fields = (view.columns || []).map(
      (column) => new ViewColumnData(column)
    );
  }
}

export class ViewColumnData {
  public readonly id: string;
  public readonly name: string;
  public readonly type: string;
  public readonly properties: ViewColumn['properties'];

  constructor(column: ViewColumn) {
    this.id = uuidv4();
    this.name = column.name;
    this.type = column.type || '';
    this.properties = column.properties;
  }
}

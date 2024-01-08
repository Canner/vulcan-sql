import type { Meta } from '@storybook/react';
import Diagram from '.';
import { PayloadData } from './types';
import styled from 'styled-components';

const StyledDiagram = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
`;

interface Props {
  data: PayloadData;
  onInfoIconClick: (data: any) => void;
}

const Story: Meta<typeof Diagram> = {
  component: (props: Props) => {
    return (
      <StyledDiagram>
        <Diagram {...props} />
      </StyledDiagram>
    );
  },

  title: 'Diagram',
};
export default Story;

export const Default = {
  args: {
    data: {
      catalog: 'canner-cml',
      schema: 'tpch_tiny',
      models: [
        {
          nodeType: 'model',
          id: 'ab2c3a86-454f-4810-a61b-c60b0ac69c77',
          name: 'Orders',
          description: '',
          refSql: 'select * from "canner-cml".tpch_tiny.orders',
          columns: [
            {
              id: '29b3271f-67b1-4f5e-b854-1accd8b88e9d',
              name: 'orderkey',
              type: 'integer',
              isPrimaryKey: true,
            },
            {
              id: 'd44fec17-1080-4606-a5da-7b209fc8938a',
              name: 'custkey',
              type: 'integer',
              isPrimaryKey: false,
            },
            {
              id: 'dd1c023c-0c6e-48a1-8d1d-4a7a10e610bb',
              name: 'orderstatus',
              type: 'string',
              isPrimaryKey: false,
            },
            {
              id: '79dff352-dad4-44a4-814b-82a75d79cf05',
              name: 'totalprice',
              type: 'float',
              isPrimaryKey: false,
            },
            {
              id: '329dcf84-ae89-4ce8-9349-da0c2f9213da',
              name: 'orderdate',
              type: 'date',
              isPrimaryKey: false,
            },
            {
              id: 'ca3b89b6-0757-40ad-9d03-1ee74aec36fe',
              name: 'customer',
              type: 'Customer',
              relationship: {
                name: 'OrdersCustomer',
                models: ['Orders', 'Customer'],
                joinType: 'MANY_TO_ONE',
                condition: 'Orders.custkey = Customer.custkey',
              },
              isPrimaryKey: false,
            },
          ],
          relationships: [
            {
              name: 'OrdersCustomer',
              models: ['Orders', 'Customer'],
              joinType: 'MANY_TO_ONE',
              condition: 'Orders.custkey = Customer.custkey',
            },
            {
              name: 'OrdersLineitem',
              models: ['Orders', 'Lineitem'],
              joinType: 'ONE_TO_MANY',
              condition: 'Orders.orderkey = Lineitem.orderkey',
            },
          ],
        },
        {
          nodeType: 'model',
          id: '8552dcdb-8547-4deb-bf4a-634160dd6022',
          name: 'Customer',
          description: '',
          refSql: 'select * from "canner-cml".tpch_tiny.customer',
          columns: [
            {
              id: '29148dd6-de73-4a88-91e7-e1095612b928',
              name: 'custkey',
              type: 'integer',
              isPrimaryKey: true,
            },
            {
              id: '1bf6a352-3b16-46c4-8fe5-aa6cf42a9ad5',
              name: 'name',
              type: 'string',
              isPrimaryKey: false,
            },
            {
              id: 'fc296bd6-3296-43fc-8a01-0d5be2055a07',
              name: 'orders',
              type: 'Orders',
              relationship: {
                name: 'OrdersCustomer',
                models: ['Orders', 'Customer'],
                joinType: 'MANY_TO_ONE',
                condition: 'Orders.custkey = Customer.custkey',
              },
              isPrimaryKey: false,
            },
          ],
          relationships: [
            {
              name: 'OrdersCustomer',
              models: ['Orders', 'Customer'],
              joinType: 'MANY_TO_ONE',
              condition: 'Orders.custkey = Customer.custkey',
            },
          ],
        },
        {
          nodeType: 'model',
          id: 'f886f309-701e-48c8-888a-ae23014eff7c',
          name: 'Lineitem',
          description: '',
          refSql: 'select * from "canner-cml".tpch_tiny.lineitem',
          columns: [
            {
              id: 'bca83521-7d86-4a05-960a-e92c5c3b1dda',
              name: 'orderkey',
              type: 'integer',
              isPrimaryKey: false,
            },
            {
              id: '61ffd45b-9e89-4c2c-90f6-64c4241c046e',
              name: 'partkey',
              type: 'integer',
              isPrimaryKey: false,
            },
            {
              id: 'b30f49d8-c147-4432-b99f-1e64c3707259',
              name: 'linenumber',
              type: 'integer',
              isPrimaryKey: false,
            },
            {
              id: '4173e9be-9334-4401-8f8a-36f7d65be8c9',
              name: 'extendedprice',
              type: 'double',
              isPrimaryKey: false,
            },
            {
              id: '7b154558-d8b5-4828-b5ff-eac0720f472f',
              name: 'discount',
              type: 'double',
              isPrimaryKey: false,
            },
            {
              id: '25b4949b-63b3-48ce-8517-9ff95e2a5548',
              name: 'shipdate',
              type: 'date',
              isPrimaryKey: false,
            },
            {
              id: '88f2c8c6-3623-4a7b-83a8-81d4908dccc6',
              name: 'orderkey_linenumber',
              type: 'string',
              isPrimaryKey: true,
            },
            {
              id: '8ff8daf9-46b3-4ce6-8efb-93730a09f6a2',
              name: 'part',
              type: 'Part',
              relationship: {
                name: 'LineitemPart',
                models: ['Lineitem', 'Part'],
                joinType: 'MANY_TO_ONE',
                condition: 'Lineitem.partkey = Part.partkey',
              },
              isPrimaryKey: false,
            },
            {
              id: '04bdfa96-1712-4e42-bd3d-a33a7c3ac5d7',
              name: 'order',
              type: 'Orders',
              relationship: {
                name: 'OrdersLineitem',
                models: ['Orders', 'Lineitem'],
                joinType: 'ONE_TO_MANY',
                condition: 'Orders.orderkey = Lineitem.orderkey',
              },
              isPrimaryKey: false,
            },
          ],
          relationships: [
            {
              name: 'OrdersLineitem',
              models: ['Orders', 'Lineitem'],
              joinType: 'ONE_TO_MANY',
              condition: 'Orders.orderkey = Lineitem.orderkey',
            },
            {
              name: 'LineitemPart',
              models: ['Lineitem', 'Part'],
              joinType: 'MANY_TO_ONE',
              condition: 'Lineitem.partkey = Part.partkey',
            },
          ],
        },
        {
          nodeType: 'model',
          id: 'c03d4a89-1795-40a6-b969-2c042bdcf494',
          name: 'Part',
          description: '',
          refSql: 'select * from "canner-cml".tpch_tiny.part',
          columns: [
            {
              id: '63db4c66-8583-452f-a84d-5d4e4ddd2c54',
              name: 'partkey',
              type: 'integer',
              isPrimaryKey: true,
            },
            {
              id: '88ce55cc-d0d8-4a3c-859c-acf6f3383a1f',
              name: 'name',
              type: 'string',
              isPrimaryKey: false,
            },
          ],
          relationships: [
            {
              name: 'LineitemPart',
              models: ['Lineitem', 'Part'],
              joinType: 'MANY_TO_ONE',
              condition: 'Lineitem.partkey = Part.partkey',
            },
          ],
        },
      ],
      relationships: [
        {
          name: 'OrdersCustomer',
          models: ['Orders', 'Customer'],
          joinType: 'MANY_TO_ONE',
          condition: 'Orders.custkey = Customer.custkey',
        },
        {
          name: 'OrdersLineitem',
          models: ['Orders', 'Lineitem'],
          joinType: 'ONE_TO_MANY',
          condition: 'Orders.orderkey = Lineitem.orderkey',
        },
        {
          name: 'LineitemPart',
          models: ['Lineitem', 'Part'],
          joinType: 'MANY_TO_ONE',
          condition: 'Lineitem.partkey = Part.partkey',
        },
      ],
      metrics: [
        {
          nodeType: 'metric',
          preAggregated: true,
          refreshTime: '2m',
          columns: [
            {
              id: 'c8e3be69-6da8-4c9e-8d83-c422e364e158',
              name: 'custkey',
              type: 'integer',
              metricType: 'dimension',
            },
            {
              id: 'ad66d666-b854-433a-89b9-98d5e3b37d89',
              name: 'totalprice',
              type: 'integer',
              metricType: 'measure',
              expression: 'sum(totalprice)',
            },
            {
              id: '8beeb29a-500d-4b3d-b1d1-837e0dee2660',
              name: 'orderdate',
              type: '',
              metricType: 'timeGrain',
              refColumn: 'orderdate',
              dateParts: ['YEAR', 'MONTH'],
            },
          ],
          id: 'dc7a598c-de92-48ee-ac7c-2588f9687e16',
          name: 'Revenue',
          description: '',
          baseModel: 'Orders',
        },
      ],
    },
  },
  argTypes: {
    onInfoIconClick: { action: 'clicked' },
  },
};

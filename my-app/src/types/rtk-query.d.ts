declare module '@reduxjs/toolkit/query/react' {
  import { BaseQueryFn, EndpointDefinitions } from '@reduxjs/toolkit/query';
  export interface ApiEndpointQuery<ResultType, QueryArg, BaseQuery extends BaseQueryFn> {
    query: (arg: QueryArg) => Parameters<BaseQuery>[0];
  }
  export interface ApiEndpointMutation<ResultType, QueryArg, BaseQuery extends BaseQueryFn> {
    query: (arg: QueryArg) => Parameters<BaseQuery>[0];
  }
  export function createApi<
    BaseQuery extends BaseQueryFn,
    Definitions extends EndpointDefinitions,
    ReducerPath extends string = string,
    TagTypes extends string = never
  >(
    options: {
      baseQuery: BaseQuery;
      endpoints: (builder: EndpointBuilder<BaseQuery, TagTypes>) => Definitions;
      reducerPath?: ReducerPath;
      tagTypes?: TagTypes[];
    }
  ): any;
  export interface EndpointBuilder<BaseQuery extends BaseQueryFn, TagTypes extends string> {
    query<ResultType, QueryArg>(
      options: ApiEndpointQuery<ResultType, QueryArg, BaseQuery>
    ): any;
    mutation<ResultType, QueryArg>(
      options: ApiEndpointMutation<ResultType, QueryArg, BaseQuery>
    ): any;
  }
  export function fetchBaseQuery(options: { baseUrl: string }): BaseQueryFn;
}
declare module '@reduxjs/toolkit/query' {
  export interface BaseQueryFn<
    Args = any,
    Result = unknown,
    Error = unknown,
    DefinitionExtraOptions = {},
    Meta = {}
  > {
    (args: Args, api: any, extraOptions: DefinitionExtraOptions): Promise<
      { data: Result; meta?: Meta } | { error: Error; meta?: Meta }
    >;
  }
  export type EndpointDefinitions = Record<string, any>;
  export function setupListeners(dispatch: any): () => void;
} 
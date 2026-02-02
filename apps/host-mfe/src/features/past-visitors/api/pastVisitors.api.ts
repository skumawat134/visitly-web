import { getApiClient } from '@visitly/api-client'


import type {
  PastVisitorsResponse,
  PastVisitorsQueryParams,
} from './pastVisitors.types'


  export async function  getPastVisitors(params : PastVisitorsQueryParams) : Promise<PastVisitorsResponse>{
     const { data } = await  getApiClient().get<PastVisitorsResponse>("/v1/host/visits", { params }); 
     return data;
  }

  export async function getVisitorDetail(params : string) : Promise<any>{
    const { data } = await getApiClient().get(`/v1/visits/${params}`)
    return data;
  }
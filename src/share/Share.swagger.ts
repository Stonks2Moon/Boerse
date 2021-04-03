import {
  ApiParamOptions,
  ApiQueryOptions,
  ApiResponseOptions,
} from '@nestjs/swagger';

export const RESPONSE_AVAILABLE_SHARES: ApiResponseOptions = {
  description:
    'Returns an array with all tradeable shares and their current prices.',
};

export const RESPONSE_CURRENT_PRICE: ApiResponseOptions = {
  description:
    "The current price of a given share. Price will be null if share with id 'shareId' doesn't exist.",
};

export const RESPONSE_PRICES: ApiResponseOptions = {
  description:
    "Returns a list of prices of a given share. List will be empty if share with id 'shareId' doesn't exist or the price list is empty.",
};

export const RESPONSE_CREATE_SHARE: ApiResponseOptions = {
  description: 'Returns the newly created share.',
};

export const RESPONSE_PATCH_SHARE: ApiResponseOptions = {
  description: 'Returns the patched share.',
};

export const PARAM_SHARE_ID: ApiParamOptions = {
  name: 'shareId',
  example: '6037e67c8407c737441517d6',
};

export const QUERY_FROM_TS: ApiQueryOptions = {
  name: 'from',
  required: false,
  description: 'Specify a timestamp as lower limit of the query',
  example: 1616792676000,
};

export const QUERY_UNTIL_TS: ApiQueryOptions = {
  name: 'until',
  required: false,
  description: 'Specify a timestamp as upper limit of the query',
  example: 1616702676000,
};

export const QUERY_LIMIT: ApiQueryOptions = {
  name: 'limit',
  required: false,
  description: 'Specify the maximum number of results',
  example: 10,
};

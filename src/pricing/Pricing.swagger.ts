import {
  ApiBodyOptions,
  ApiParamOptions,
  ApiResponseOptions,
} from '@nestjs/swagger';

export const RESPONSE_AVAILABLE_PRICINGS: ApiResponseOptions = {
  description:
    'Returns an array with all pricings and their corresponding types.',
};

export const RESPONSE_PRICING_TYPES: ApiResponseOptions = {
  description: 'Returns an array with all available pricing types.',
};

export const RESPONSE_PRICING_FOR_TYPE: ApiResponseOptions = {
  description: 'Returns pricing for given type.',
};

export const PARAM_TYPE: ApiParamOptions = {
  name: 'type',
  example: 'Business',
};

export const RESPONSE_DELETE_PRICING_FOR_TYPE: ApiResponseOptions = {
  description: 'Deletes pricing of given type. Returns void.',
};

export const RESPONSE_SET_PRICING: ApiResponseOptions = {
  description: 'Returns new or updated pricing.',
};

export const BODY_SET_PRICING: ApiBodyOptions = {
  description: 'Returns new or updated pricing.',
};

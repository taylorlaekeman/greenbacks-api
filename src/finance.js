import { Client, environments } from 'plaid';

import { InputError } from 'errors';

class FinanceClient {
  constructor(input) {
    validateConstructorInput(input);
    const { env, id, secret } = input;
    this.client = new Client({
      clientID: id,
      env: environments[env],
      secret,
      options: {
        version: '2019-05-29',
      },
    });
  }

  async createConnectionInitializationToken(input) {
    validateCreateConnectionInitializationTokenInput(input);
    const { id } = input;
    const settings = {
      client_name: 'Greenbacks',
      country_codes: ['US', 'CA'],
      language: 'en',
      products: ['transactions'],
      user: { client_user_id: id },
    };
    try {
      const response = await this.client.createLinkToken(settings);
      return response.link_token;
    } catch (error) {
      if (error.message === 'INVALID_FIELD') throw new AuthenticationError();
      throw error;
    }
  }

  async describeConnection(input) {
    validateDescribeAccountInput(input);
    const { token } = input;
    let institution;
    let item;
    try {
      item = await this.client.getItem(token);
      institution = await this.client.getInstitutionById(
        item.item.institution_id
      );
    } catch (error) {
      if (error.message === 'INVALID_FIELD') throw new AuthenticationError();
      throw error;
    }
    const {
      institution: { institution_id: id, name },
    } = institution;
    return {
      id,
      name,
    };
  }

  async exchangeTemporaryConnectionToken(input) {
    validateExchangeTemporaryConnectionTokenInput(input);
    const { token } = input;
    try {
      const response = await this.client.exchangePublicToken(token);
      return response.access_token;
    } catch (error) {
      if (error.message === 'INVALID_FIELD') throw new AuthenticationError();
      throw new TokenError();
    }
  }
}

const validateConstructorInput = ({ env, id, secret }) => {
  if (!env || !(env in environments)) throw new InputError('env');
  if (!id) throw new InputError('id');
  if (!secret) throw new InputError('secret');
};

const validateCreateConnectionInitializationTokenInput = ({ id }) => {
  if (!id) throw new InputError('id');
};

const validateDescribeAccountInput = ({ token }) => {
  if (!token) throw new InputError('token');
};

const validateExchangeTemporaryConnectionTokenInput = ({ token }) => {
  if (!token) throw new InputError('token');
};

export class AuthenticationError extends Error {
  constructor() {
    super('Failed to authenticate with transaction server');
  }
}

export class TokenError extends Error {
  constructor() {
    super('Invalid token');
  }
}

export default FinanceClient;
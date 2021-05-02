import { InputError } from 'errors';
import { MissingTableError } from 'storage/client';

class Connections {
  constructor(input) {
    validateConstructorInput(input);
    const { environment, storageClient, user } = input;
    this.storageClient = storageClient;
    this.table = `${environment}-connections`;
    this.user = user;
  }

  async create(input) {
    validateCreateInput(input);
    const { id, name, token } = input;
    const now = new Date().toISOString();
    const addItemsInput = {
      items: {
        createdDate: now,
        id,
        institution: {
          name,
        },
        modifiedDate: now,
        token,
        user: this.user,
      },
      key: {
        partition: {
          name: 'user',
          type: 'string',
        },
        sort: {
          name: 'token',
          type: 'string',
        },
      },
      table: this.table,
    };
    await this.storageClient.addItemsAndCreateTable(addItemsInput);
  }

  async list() {
    try {
      return await this.storageClient.listItems({
        key: { partition: { user: this.user } },
        table: this.table,
      });
    } catch (error) {
      if (error instanceof MissingTableError) return [];
      throw error;
    }
  }
}

const validateConstructorInput = ({ environment, storageClient, user }) => {
  if (!environment) throw new InputError('environment');
  if (!storageClient) throw new InputError('storageClient');
  if (!user) throw new InputError('user');
};

const validateCreateInput = ({ id, name, token }) => {
  if (!id) throw new InputError('id');
  if (!name) throw new InputError('name');
  if (!token) throw new InputError('token');
};

export default Connections;

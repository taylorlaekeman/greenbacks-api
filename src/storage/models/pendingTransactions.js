import { InputError } from 'errors';

class PendingTransactions {
  constructor(input) {
    validateConstructorInput(input);
    const { environment, storageClient, user } = input;
    this.storageClient = storageClient;
    this.table = `${environment}-pending-transactions`;
    this.user = user;
  }
}

const validateConstructorInput = ({ environment, storageClient, user }) => {
  if (!environment) throw new InputError();
  if (!storageClient) throw new InputError();
  if (!user) throw new InputError();
};

export default PendingTransactions;

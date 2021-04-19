import yargs from 'yargs'
import * as Transactions from '@waves/waves-transactions'

const WVS = 10 ** 8
const FEE_MULTIPLIER = 10 ** 5

const transfer = async (
  receiver: string,
  amount: number,
  seed: string,
  chainId: string,
  nodeUrl: string
) => {
  const params: Transactions.ITransferParams = {
    recipient: receiver,
    amount: Math.floor(amount * WVS),
    fee: 5 * FEE_MULTIPLIER,
    chainId
  }

  const tx = Transactions.transfer(params, seed)
  const ttx = await Transactions.broadcast(tx, nodeUrl)
  await Transactions.waitForTx(ttx.id, { apiBase: nodeUrl })
  return ttx.id
}

const insertData = async (
  key: string,
  value: string | number | boolean,
  seed: string,
  chainId: string,
  nodeUrl: string
) => {
  const params: Transactions.IDataParams = {
    data: [{ key, value }],
    fee: 5 * FEE_MULTIPLIER,
    chainId
  }

  const tx = Transactions.data(params, seed)
  const ttx = await Transactions.broadcast(tx, nodeUrl)
  await Transactions.waitForTx(ttx.id, { apiBase: nodeUrl })
  return ttx.id
}

yargs(process.argv.slice(2))
  .command(
    'transfer [receiver] [amount] [seed]',
    'Transfer tokens to address',
    (yargs: any) => {
      yargs
        .positional('receiver', {
          describe: 'Receiver address',
          type: 'string'
        })
        .demandOption('receiver')
      yargs
        .positional('amount', {
          describe: 'Amount',
          type: 'number'
        })
        .demandOption('amount')
      yargs
        .positional('seed', {
          describe: 'Sender seed',
          type: 'string'
        })
        .demandOption('seed')
    },
    (yargs: any) => {
      transfer(yargs.receiver, yargs.amount, yargs.seed, yargs.c, yargs.n)
        .then((hash) => console.log(`SUCCESS TxHash ${hash}`))
        .catch((err) => console.log(err))
    }
  )
  .command(
    'insert [key] [value] [seed]',
    'Insert data into address',
    (yargs: any) => {
      yargs
        .positional('key', {
          describe: 'Data entry key',
          type: 'string'
        })
        .demandOption('key')
      yargs
        .positional('value', {
          describe: 'Data entry value'
        })
        .demandOption('value')
      yargs
        .positional('seed', {
          describe: 'Sender seed',
          type: 'string'
        })
        .demandOption('seed')
    },
    (yargs: any) => {
      insertData(yargs.key, yargs.value, yargs.seed, yargs.c, yargs.n)
        .then((hash) => console.log(`SUCCESS TxHash ${hash}`))
        .catch((err) => console.log(err))
    }
  )
  .options({
    c: { type: 'string', default: 'T', alias: 'chainId' },
    n: {
      type: 'string',
      default: 'https://nodes-testnet.wavesnodes.com',
      alias: 'nodeUrl'
    }
  }).argv

import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionReposotory = getCustomRepository(TransactionsRepository);

    const categoryRepository = getRepository(Category);

    const { total } = await transactionReposotory.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('YOu no not have enough balance');
    }

    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionReposotory.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionReposotory.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

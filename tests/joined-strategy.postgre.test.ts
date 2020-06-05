import { LoadStrategy, Logger, MikroORM, wrap } from '@mikro-orm/core';
import { AbstractSqlConnection, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { initORMPostgreSql, wipeDatabasePostgreSql } from './bootstrap';
import { Author2, Book2, BookTag2, FooBar2, FooBaz2 } from './entities-sql';

describe('Joined loading strategy', () => {

  let orm: MikroORM<PostgreSqlDriver>;

  beforeAll(async () => orm = await initORMPostgreSql());
  beforeEach(async () => wipeDatabasePostgreSql(orm.em));

  afterAll(async () => orm.close(true));

  test('populate OneToMany with joined strategy [findOne()]', async () => {
    const author = new Author2('Albert Camus', 'albert.camus@email.com');
    const stranger = new Book2('The Stranger', author, 100);
    const fall = new Book2('The Fall', author, 200);
    author.books2.add(stranger, fall);
    await orm.em.persistAndFlush(author);
    orm.em.clear();

    const a2 = await orm.em.findOneOrFail(Author2, author, { populate: ['books2', 'following'] });
    expect(a2.books2).toHaveLength(2);
    expect(a2.books2[0].title).toBe('The Stranger');
    expect(a2.books2[0].priceTaxed).toBe(119);
    expect(a2.books2[1].title).toBe('The Fall');
    expect(a2.books2[1].priceTaxed).toBe(238);
  });

  test('populate OneToMany with joined strategy [find()]', async () => {
    const a1 = new Author2('Albert Camus 1', 'albert.camus1@email.com');
    a1.books2.add(new Book2('The Stranger 1', a1, 100), new Book2('The Fall 1', a1, 200));
    const a2 = new Author2('Albert Camus 2', 'albert.camus2@email.com');
    a2.books2.add(new Book2('The Stranger 2', a2, 300), new Book2('The Fall 2', a2, 400));
    const a3 = new Author2('Albert Camus 3', 'albert.camus3@email.com');
    a3.books2.add(new Book2('The Stranger 3', a3, 500), new Book2('The Fall 3', a3, 600));
    await orm.em.persistAndFlush([a1, a2, a3]);
    orm.em.clear();

    const ret = await orm.em.find(Author2, {}, { populate: ['books2', 'following'], orderBy: { email: 'asc' } });
    expect(ret).toHaveLength(3);
    expect(ret[0].books2).toHaveLength(2);
    expect(ret[0].books2[0].title).toEqual('The Stranger 1');
    expect(ret[0].books2[0].priceTaxed).toBe(119);
    expect(ret[0].books2[1].title).toEqual('The Fall 1');
    expect(ret[0].books2[1].priceTaxed).toBe(238);
    expect(ret[1].books2).toHaveLength(2);
    expect(ret[1].books2[0].title).toEqual('The Stranger 2');
    expect(ret[1].books2[0].priceTaxed).toBe(357);
    expect(ret[1].books2[1].title).toEqual('The Fall 2');
    expect(ret[1].books2[1].priceTaxed).toBe(476);
    expect(ret[2].books2).toHaveLength(2);
    expect(ret[2].books2[0].title).toEqual('The Stranger 3');
    expect(ret[2].books2[0].priceTaxed).toBe(595);
    expect(ret[2].books2[1].title).toEqual('The Fall 3');
    expect(ret[2].books2[1].priceTaxed).toBe(714);
  });

  test('populate ManyToOne with joined strategy [findOne()]', async () => {
    const author = new Author2('Albert Camus', 'albert.camus@email.com');
    const stranger = new Book2('The Stranger', author);
    const fall = new Book2('The Fall', author);
    author.books2.add(stranger, fall);
    await orm.em.persistAndFlush(author);
    orm.em.clear();

    const b1 = await orm.em.findOneOrFail(Book2, stranger, { populate: { author: LoadStrategy.JOINED } });
    expect(b1.title).toEqual('The Stranger');
    expect(b1.author.name).toEqual('Albert Camus');
  });

  test('populate ManyToOne with joined strategy [find()]', async () => {
    const a1 = new Author2('Albert Camus 1', 'albert.camus1@email.com');
    a1.books2.add(new Book2('The Stranger 1', a1), new Book2('The Fall 1', a1));
    const a2 = new Author2('Albert Camus 2', 'albert.camus2@email.com');
    a2.books2.add(new Book2('The Stranger 2', a2), new Book2('The Fall 2', a2));
    const a3 = new Author2('Albert Camus 3', 'albert.camus3@email.com');
    a3.books2.add(new Book2('The Stranger 3', a3), new Book2('The Fall 3', a3));
    await orm.em.persistAndFlush([a1, a2, a3]);
    orm.em.clear();

    const books = await orm.em.find(Book2, {}, { populate: { author: LoadStrategy.JOINED } });
    expect(books).toHaveLength(6);
    expect(books[0].title).toBe('The Stranger 1');
    expect(books[0].author.name).toBe('Albert Camus 1');
    expect(books[2].title).toBe('The Stranger 2');
    expect(books[2].author.name).toBe('Albert Camus 2');
    expect(books[4].title).toBe('The Stranger 3');
    expect(books[4].author.name).toBe('Albert Camus 3');
  });

  test('should only fire one query [findOne()]', async () => {
    const author2 = new Author2('Albert Camus', 'albert.camus@email.com');
    const stranger = new Book2('The Stranger', author2, 100);
    const fall = new Book2('The Fall', author2, 200);
    author2.books2.add(stranger, fall);
    await orm.em.persistAndFlush(author2);
    orm.em.clear();

    const mock = jest.fn();
    const logger = new Logger(mock, true);
    Object.assign(orm.em.config, { logger });

    await orm.em.findOneOrFail(Author2, { id: author2.id }, { populate: { books2: { perex: true } } });
    expect(mock.mock.calls.length).toBe(1);
    expect(mock.mock.calls[0][0]).toMatch('select "e0"."id", "e0"."created_at", "e0"."updated_at", "e0"."name", "e0"."email", "e0"."age", "e0"."terms_accepted", "e0"."optional", "e0"."identities", "e0"."born", "e0"."born_time", "e0"."favourite_book_uuid_pk", "e0"."favourite_author_id", ' +
      '"b1"."uuid_pk" as "b1_uuid_pk", "b1"."created_at" as "b1_created_at", "b1"."title" as "b1_title", "b1"."perex" as "b1_perex", "b1"."price" as "b1_price", "b1".price * 1.19 as "b1_price_taxed", "b1"."double" as "b1_double", "b1"."meta" as "b1_meta", "b1"."author_id" as "b1_author_id", "b1"."publisher_id" as "b1_publisher_id" ' +
      'from "author2" as "e0" ' +
      'left join "book2" as "b1" on "e0"."id" = "b1"."author_id" ' +
      'where "e0"."id" = $1');

    orm.em.clear();
    mock.mock.calls.length = 0;
    await orm.em.findOneOrFail(Author2, { id: author2.id }, { populate: { books2: true } });
    expect(mock.mock.calls.length).toBe(1);
    expect(mock.mock.calls[0][0]).toMatch('select "e0"."id", "e0"."created_at", "e0"."updated_at", "e0"."name", "e0"."email", "e0"."age", "e0"."terms_accepted", "e0"."optional", "e0"."identities", "e0"."born", "e0"."born_time", "e0"."favourite_book_uuid_pk", "e0"."favourite_author_id", ' +
      '"b1"."uuid_pk" as "b1_uuid_pk", "b1"."created_at" as "b1_created_at", "b1"."title" as "b1_title", "b1"."price" as "b1_price", "b1".price * 1.19 as "b1_price_taxed", "b1"."double" as "b1_double", "b1"."meta" as "b1_meta", "b1"."author_id" as "b1_author_id", "b1"."publisher_id" as "b1_publisher_id" ' +
      'from "author2" as "e0" ' +
      'left join "book2" as "b1" on "e0"."id" = "b1"."author_id" ' +
      'where "e0"."id" = $1');

    orm.em.clear();
    mock.mock.calls.length = 0;
    await orm.em.findOneOrFail(Author2, { id: author2.id }, { populate: { books: LoadStrategy.JOINED } });
    expect(mock.mock.calls.length).toBe(1);
    expect(mock.mock.calls[0][0]).toMatch('select "e0"."id", "e0"."created_at", "e0"."updated_at", "e0"."name", "e0"."email", "e0"."age", "e0"."terms_accepted", "e0"."optional", "e0"."identities", "e0"."born", "e0"."born_time", "e0"."favourite_book_uuid_pk", "e0"."favourite_author_id", ' +
      '"b1"."uuid_pk" as "b1_uuid_pk", "b1"."created_at" as "b1_created_at", "b1"."title" as "b1_title", "b1"."price" as "b1_price", "b1".price * 1.19 as "b1_price_taxed", "b1"."double" as "b1_double", "b1"."meta" as "b1_meta", "b1"."author_id" as "b1_author_id", "b1"."publisher_id" as "b1_publisher_id" ' +
      'from "author2" as "e0" ' +
      'left join "book2" as "b1" on "e0"."id" = "b1"."author_id" ' +
      'where "e0"."id" = $1');

    orm.em.clear();
    mock.mock.calls.length = 0;
    await orm.em.findOneOrFail(Author2, { id: author2.id }, { populate: { books: [LoadStrategy.JOINED, { perex: true }] } });
    expect(mock.mock.calls.length).toBe(1);
    expect(mock.mock.calls[0][0]).toMatch('select "e0"."id", "e0"."created_at", "e0"."updated_at", "e0"."name", "e0"."email", "e0"."age", "e0"."terms_accepted", "e0"."optional", "e0"."identities", "e0"."born", "e0"."born_time", "e0"."favourite_book_uuid_pk", "e0"."favourite_author_id", ' +
      '"b1"."uuid_pk" as "b1_uuid_pk", "b1"."created_at" as "b1_created_at", "b1"."title" as "b1_title", "b1"."perex" as "b1_perex", "b1"."price" as "b1_price", "b1".price * 1.19 as "b1_price_taxed", "b1"."double" as "b1_double", "b1"."meta" as "b1_meta", "b1"."author_id" as "b1_author_id", "b1"."publisher_id" as "b1_publisher_id" ' +
      'from "author2" as "e0" ' +
      'left join "book2" as "b1" on "e0"."id" = "b1"."author_id" ' +
      'where "e0"."id" = $1');
  });

  test('should only fire one query [find()]', async () => {
    const author2 = new Author2('Albert Camus', 'albert.camus@email.com');
    const stranger = new Book2('The Stranger', author2, 100);
    const fall = new Book2('The Fall', author2, 200);
    author2.books2.add(stranger, fall);
    await orm.em.persistAndFlush(author2);
    orm.em.clear();

    const mock = jest.fn();
    const logger = new Logger(mock, true);
    Object.assign(orm.em.config, { logger });

    await orm.em.find(Author2, { id: author2.id }, { populate: { books2: { perex: true } } });
    expect(mock.mock.calls.length).toBe(1);
    expect(mock.mock.calls[0][0]).toMatch('select "e0"."id", "e0"."created_at", "e0"."updated_at", "e0"."name", "e0"."email", "e0"."age", "e0"."terms_accepted", "e0"."optional", "e0"."identities", "e0"."born", "e0"."born_time", "e0"."favourite_book_uuid_pk", "e0"."favourite_author_id", ' +
      '"b1"."uuid_pk" as "b1_uuid_pk", "b1"."created_at" as "b1_created_at", "b1"."title" as "b1_title", "b1"."perex" as "b1_perex", "b1"."price" as "b1_price", "b1".price * 1.19 as "b1_price_taxed", "b1"."double" as "b1_double", "b1"."meta" as "b1_meta", "b1"."author_id" as "b1_author_id", "b1"."publisher_id" as "b1_publisher_id" ' +
      'from "author2" as "e0" ' +
      'left join "book2" as "b1" on "e0"."id" = "b1"."author_id" ' +
      'where "e0"."id" = $1');

    orm.em.clear();
    mock.mock.calls.length = 0;
    await orm.em.find(Author2, { id: author2.id }, { populate: { books2: true } });
    expect(mock.mock.calls.length).toBe(1);
    expect(mock.mock.calls[0][0]).toMatch('select "e0"."id", "e0"."created_at", "e0"."updated_at", "e0"."name", "e0"."email", "e0"."age", "e0"."terms_accepted", "e0"."optional", "e0"."identities", "e0"."born", "e0"."born_time", "e0"."favourite_book_uuid_pk", "e0"."favourite_author_id", ' +
      '"b1"."uuid_pk" as "b1_uuid_pk", "b1"."created_at" as "b1_created_at", "b1"."title" as "b1_title", "b1"."price" as "b1_price", "b1".price * 1.19 as "b1_price_taxed", "b1"."double" as "b1_double", "b1"."meta" as "b1_meta", "b1"."author_id" as "b1_author_id", "b1"."publisher_id" as "b1_publisher_id" ' +
      'from "author2" as "e0" ' +
      'left join "book2" as "b1" on "e0"."id" = "b1"."author_id" ' +
      'where "e0"."id" = $1');

    orm.em.clear();
    mock.mock.calls.length = 0;
    await orm.em.find(Author2, { id: author2.id }, { populate: { books: LoadStrategy.JOINED } });
    expect(mock.mock.calls.length).toBe(1);
    expect(mock.mock.calls[0][0]).toMatch('select "e0"."id", "e0"."created_at", "e0"."updated_at", "e0"."name", "e0"."email", "e0"."age", "e0"."terms_accepted", "e0"."optional", "e0"."identities", "e0"."born", "e0"."born_time", "e0"."favourite_book_uuid_pk", "e0"."favourite_author_id", ' +
      '"b1"."uuid_pk" as "b1_uuid_pk", "b1"."created_at" as "b1_created_at", "b1"."title" as "b1_title", "b1"."price" as "b1_price", "b1".price * 1.19 as "b1_price_taxed", "b1"."double" as "b1_double", "b1"."meta" as "b1_meta", "b1"."author_id" as "b1_author_id", "b1"."publisher_id" as "b1_publisher_id" ' +
      'from "author2" as "e0" ' +
      'left join "book2" as "b1" on "e0"."id" = "b1"."author_id" ' +
      'where "e0"."id" = $1');

    orm.em.clear();
    mock.mock.calls.length = 0;
    await orm.em.find(Author2, { id: author2.id }, { populate: { books: [LoadStrategy.JOINED, { perex: true }] } });
    expect(mock.mock.calls.length).toBe(1);
    expect(mock.mock.calls[0][0]).toMatch('select "e0"."id", "e0"."created_at", "e0"."updated_at", "e0"."name", "e0"."email", "e0"."age", "e0"."terms_accepted", "e0"."optional", "e0"."identities", "e0"."born", "e0"."born_time", "e0"."favourite_book_uuid_pk", "e0"."favourite_author_id", ' +
      '"b1"."uuid_pk" as "b1_uuid_pk", "b1"."created_at" as "b1_created_at", "b1"."title" as "b1_title", "b1"."perex" as "b1_perex", "b1"."price" as "b1_price", "b1".price * 1.19 as "b1_price_taxed", "b1"."double" as "b1_double", "b1"."meta" as "b1_meta", "b1"."author_id" as "b1_author_id", "b1"."publisher_id" as "b1_publisher_id" ' +
      'from "author2" as "e0" ' +
      'left join "book2" as "b1" on "e0"."id" = "b1"."author_id" ' +
      'where "e0"."id" = $1');
  });

  test('populate ManyToMany with joined strategy', async () => {
    const author = new Author2('name', 'email');
    const b1 = new Book2('b1', author);
    const b2 = new Book2('b2', author);
    const b3 = new Book2('b3', author);
    const b4 = new Book2('b4', author);
    const b5 = new Book2('b5', author);
    const tag1 = new BookTag2('silly');
    const tag2 = new BookTag2('funny');
    const tag3 = new BookTag2('sick');
    const tag4 = new BookTag2('strange');
    const tag5 = new BookTag2('sexy');
    b1.tags.add(tag1, tag3);
    b2.tags.add(tag1, tag2, tag5);
    b3.tags.add(tag5);
    b4.tags.add(tag2, tag4, tag5);
    b5.tags.add(tag5);

    author.books.add(b1, b2, b3, b4, b5);
    await orm.em.persistAndFlush(author);
    orm.em.clear();

    const mock = jest.fn();
    const logger = new Logger(mock, true);
    Object.assign(orm.em.config, { logger });
    mock.mock.calls.length = 0;
    const books = await orm.em.find(Book2, {}, { populate: { tags: LoadStrategy.JOINED }, orderBy: { tags: { name: 'desc' } } });
    expect(mock.mock.calls.length).toBe(1);
    expect(mock.mock.calls[0][0]).toMatch('select "e0"."uuid_pk", "e0"."created_at", "e0"."title", "e0"."price", "e0".price * 1.19 as "price_taxed", "e0"."double", "e0"."meta", "e0"."author_id", "e0"."publisher_id", ' +
      '"t1"."id" as "t1_id", "t1"."name" as "t1_name", "e0".price * 1.19 as "price_taxed" ' +
      'from "book2" as "e0" ' +
      'left join "book2_tags" as "e2" on "e0"."uuid_pk" = "e2"."book2_uuid_pk" ' +
      'left join "book_tag2" as "t1" on "e2"."book_tag2_id" = "t1"."id" ' +
      'order by "t1"."name" desc');

    expect(books.map(b => b.title)).toEqual(['b4', 'b2', 'b1', 'b5', 'b3']);
    expect(books[0].tags.getItems().map(t => t.name)).toEqual(['strange', 'sexy', 'funny']);
    expect(books[1].tags.getItems().map(t => t.name)).toEqual(['silly', 'sexy', 'funny']);
    expect(books[2].tags.getItems().map(t => t.name)).toEqual(['silly', 'sick']);
    expect(books[3].tags.getItems().map(t => t.name)).toEqual(['sexy']);
    expect(books[4].tags.getItems().map(t => t.name)).toEqual(['sexy']);
  });

  test('can populate all related entities', async () => {
    const author2 = new Author2('Albert Camus', 'albert.camus@email.com');
    const stranger = new Book2('The Stranger', author2, 100);
    const fall = new Book2('The Fall', author2, 200);
    author2.books2.add(stranger, fall);
    await orm.em.persistAndFlush(author2);
    orm.em.clear();

    const a2 = await orm.em.findOneOrFail(Author2, { id: author2.id }, { populate: true });
    expect(a2.books2).toHaveLength(2);
    expect(a2.books).toHaveLength(2);
  });

  test('when related records exist it still returns the root entity', async () => {
    const author2 = new Author2('Albert Camus', 'albert.camus@email.com');
    await orm.em.persistAndFlush(author2);
    orm.em.clear();

    const a2 = await orm.em.findOneOrFail(Author2, { id: author2.id }, { populate: ['books2'] });
    expect(a2).toHaveProperty('id');
    expect(a2.books2).toHaveLength(0);
  });

  test('when the root entity does not exist', async () => {
    const a2 = await orm.em.findOne(Author2, { id: 1 }, { populate: ['books2'] });
    expect(a2).toBeNull();
  });

  test('when populating only a single relation via em.populate', async () => {
    const author2 = new Author2('Albert Camus', 'albert.camus@email.com');
    const stranger = new Book2('The Stranger', author2, 100);
    const fall = new Book2('The Fall', author2, 200);
    author2.books2.add(stranger, fall);
    await orm.em.persistAndFlush(author2);
    orm.em.clear();

    const a2 = await orm.em.findOneOrFail(Author2, { id: 1 });
    await orm.em.populate(a2, 'books2');
    expect(a2.books2).toHaveLength(2);
  });

  test('populate OneToOne relation', async () => {
    const bar = FooBar2.create('bar');
    const baz = new FooBaz2('baz');
    bar.baz = baz;
    await orm.em.persistAndFlush(bar);
    orm.em.clear();

    const connMock = jest.spyOn(AbstractSqlConnection.prototype, 'execute');
    const b1 = (await orm.em.findOne(FooBar2, { id: bar.id }, { populate: { baz: LoadStrategy.JOINED } }))!;
    expect(connMock).toBeCalledTimes(1);
    expect(b1.baz).toBeInstanceOf(FooBaz2);
    expect(b1.baz!.id).toBe(baz.id);
    expect(wrap(b1).toJSON()).toMatchObject({ baz: wrap(baz).toJSON() });
  });

  test('populate OneToOne relation on inverse side', async () => {
    const bar = FooBar2.create('bar');
    const baz = new FooBaz2('baz');
    bar.baz = baz;
    await orm.em.persistAndFlush(bar);
    orm.em.clear();

    const mock = jest.fn();
    const logger = new Logger(mock, true);
    Object.assign(orm.em.config, { logger });

    // autoJoinOneToOneOwner: false
    const b0 = await orm.em.findOneOrFail(FooBaz2, { id: baz.id });
    expect(mock.mock.calls).toHaveLength(1);
    expect(mock.mock.calls[0][0]).toMatch('select "e0".* from "foo_baz2" as "e0" where "e0"."id" = $1 limit $2');
    expect(b0.bar).toBeUndefined();
    orm.em.clear();

    const b1 = (await orm.em.findOne(FooBaz2, { id: baz.id }, { populate: { bar: LoadStrategy.JOINED } }))!;
    expect(mock.mock.calls).toHaveLength(2);
    expect(mock.mock.calls[1][0]).toMatch('select "e0"."id", "e0"."name", "e0"."version", ' +
      '"b1"."id" as "b1_id", "b1"."name" as "b1_name", "b1"."baz_id" as "b1_baz_id", "b1"."foo_bar_id" as "b1_foo_bar_id", "b1"."version" as "b1_version", "b1"."blob" as "b1_blob", "b1"."array" as "b1_array", "b1"."object" as "b1_object", (select 123) as "b1_random", "b1"."id" as "bar_id" ' +
      'from "foo_baz2" as "e0" ' +
      'left join "foo_bar2" as "b1" on "e0"."id" = "b1"."baz_id" ' +
      'where "e0"."id" = $1');
    expect(b1.bar).toBeInstanceOf(FooBar2);
    expect(b1.bar!.id).toBe(bar.id);
    expect(b1.bar!.random).toBe(123);
    expect(wrap(b1).toJSON()).toMatchObject({ bar: wrap(bar).toJSON() });
    orm.em.clear();

    const b2 = (await orm.em.findOne(FooBaz2, { bar: bar.id }, { populate: { bar: LoadStrategy.JOINED } }))!;
    expect(mock.mock.calls).toHaveLength(3);
    expect(mock.mock.calls[2][0]).toMatch('select "e0"."id", "e0"."name", "e0"."version", ' +
      '"b1"."id" as "b1_id", "b1"."name" as "b1_name", "b1"."baz_id" as "b1_baz_id", "b1"."foo_bar_id" as "b1_foo_bar_id", "b1"."version" as "b1_version", "b1"."blob" as "b1_blob", "b1"."array" as "b1_array", "b1"."object" as "b1_object", (select 123) as "b1_random", "b1"."id" as "bar_id" ' +
      'from "foo_baz2" as "e0" ' +
      'left join "foo_bar2" as "b1" on "e0"."id" = "b1"."baz_id" ' +
      'where "b1"."id" = $1');
    expect(b2.bar).toBeInstanceOf(FooBar2);
    expect(b2.bar!.id).toBe(bar.id);
    expect(b2.bar!.random).toBe(123);
    expect(wrap(b2).toJSON()).toMatchObject({ bar: wrap(bar).toJSON() });
  });

  test.todo('handles nested joinedLoads that map to the same entity, eg book.author.favouriteAuthor');

});

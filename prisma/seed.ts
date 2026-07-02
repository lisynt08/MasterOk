import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  // --- Categories ---
  const cats = await Promise.all([
    db.category.upsert({ where: { slug: 'santekhnika' }, update: {}, create: { name: 'Сантехника', slug: 'santekhnika', icon: 'Wrench', color: 'sky' } }),
    db.category.upsert({ where: { slug: 'elektrika' }, update: {}, create: { name: 'Электрика', slug: 'elektrika', icon: 'Zap', color: 'amber' } }),
    db.category.upsert({ where: { slug: 'remont' }, update: {}, create: { name: 'Ремонт квартир', slug: 'remont', icon: 'Hammer', color: 'rose' } }),
    db.category.upsert({ where: { slug: 'uborka' }, update: {}, create: { name: 'Уборка', slug: 'uborka', icon: 'Sparkles', color: 'emerald' } }),
    db.category.upsert({ where: { slug: 'mebel' }, update: {}, create: { name: 'Мебель на заказ', slug: 'mebel', icon: 'Armchair', color: 'orange' } }),
    db.category.upsert({ where: { slug: 'malyar' }, update: {}, create: { name: 'Отделочные работы', slug: 'malyar', icon: 'PaintBucket', color: 'violet' } }),
    db.category.upsert({ where: { slug: 'tekhnika' }, update: {}, create: { name: 'Ремонт техники', slug: 'tekhnika', icon: 'Settings', color: 'cyan' } }),
    db.category.upsert({ where: { slug: 'landshaft' }, update: {}, create: { name: 'Ландшафтный дизайн', slug: 'landshaft', icon: 'TreePine', color: 'green' } }),
  ]);
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // --- Masters ---
  const masters = [
    { name: 'Андрей Соколов', avatar: '/avatars/m1.png', profession: 'Сантехник', city: 'Москва', area: 'ВАО, СВАО', slug: 'santekhnika', priceFrom: 800, priceTo: 12000, skills: 'монтаж труб,ремонт смесителей,установка сантехники,замена стояков', bio: 'Опытный сантехник с 12-летним стажем. Выполняю все виды сантехнических работ — от замены крана до монтажа системы водоснабжения в новостройке. Гарантия на все работы.', rating: 4.9, reviewsCount: 34, completedOrders: 156, responseTime: 'в течение часа', verified: true, topRated: true, exp: 12 },
    { name: 'Елена Морозова', avatar: '/avatars/m2.png', profession: 'Электрик', city: 'Москва', area: 'Весь город', slug: 'elektrika', priceFrom: 1000, priceTo: 25000, skills: 'электромонтаж,сборка щитков,монтаж освещения,установка розеток', bio: 'Лицензированный электрик. Специализируюсь на электромонтажных работах в квартирах и домах. Работаю по СНиП и ПУЭ. Прокладка кабеля, сборка щитков, установка автоматов.', rating: 4.8, reviewsCount: 28, completedOrders: 120, responseTime: 'в течение часа', verified: true, topRated: false, exp: 8 },
    { name: 'Сергей Волков', avatar: '/avatars/m3.png', profession: 'Мастер по ремонту', city: 'Москва', area: 'Москва и область', slug: 'remont', priceFrom: 5000, priceTo: 50000, skills: 'ремонт под ключ,стяжка полов,облицовка плиткой,гипсокартон', bio: 'Бригада из 4 человек. Делаем ремонт под ключ любой сложности — от студии до 4-комнатной квартиры. Используем качественные материалы. Работаем по договору.', rating: 4.7, reviewsCount: 41, completedOrders: 89, responseTime: 'в течение 2 часов', verified: true, topRated: false, exp: 15 },
    { name: 'Ольга Кузнецова', avatar: '/avatars/m4.png', profession: 'Специалист по уборке', city: 'Москва', area: 'ЦАО, САО, ЗАО', slug: 'uborka', priceFrom: 1500, priceTo: 8000, skills: 'уборка после ремонта,генеральная уборка,химчистка мебели,моё окон', bio: 'Профессиональная уборка квартир, домов и офисов. Использую профессиональную химию. Подготовка квартир к сдаче. Уборка после ремонта и строительства.', rating: 4.6, reviewsCount: 19, completedOrders: 210, responseTime: 'в течение 30 минут', verified: false, topRated: false, exp: 5 },
    { name: 'Дмитрий Лебедев', avatar: '/avatars/m5.png', profession: 'Мастер-мебельщик', city: 'Москва', area: 'Москва и МО', slug: 'mebel', priceFrom: 3000, priceTo: 100000, skills: 'кухни на заказ,шкафы-купе,корпусная мебель,реставрация', bio: 'Изготовление мебели на заказ — кухни, шкафы-купе, гостиные, прихожие. Работа с ЛДСП, МДФ, массивом дерева. 3D-визуализация проекта бесплатно.', rating: 4.9, reviewsCount: 22, completedOrders: 67, responseTime: 'в течение 2 часов', verified: true, topRated: true, exp: 10 },
    { name: 'Максим Петров', avatar: '/avatars/m6.png', profession: 'Маляр-штукатур', city: 'Москва', area: 'ЮВАО, ЮАО, ВАО', slug: 'malyar', priceFrom: 350, priceTo: 1800, skills: 'штукатурка по маякам,шпаклёвка,укладка плитки,декоративная штукатурка', bio: 'Маляр-штукатур высшего разряда. Идеально ровные стены, углы, потолки. Работаю с декоративными штукатурками — венецианская, травертин, короед.', rating: 4.8, reviewsCount: 31, completedOrders: 143, responseTime: 'в течение часа', verified: true, topRated: false, exp: 14 },
    { name: 'Игорь Новиков', avatar: '/avatars/m7.png', profession: 'Мастер по ремонту техники', city: 'Москва', area: 'Весь город', slug: 'tekhnika', priceFrom: 500, priceTo: 8000, skills: 'ремонт стиральных машин,ремонт холодильников,ремонт посудомоек', bio: 'Ремонт бытовой техники на дому. Стиральные машины, холодильники, посудомойки, микроволновки. Запчасти в наличии. Выезд в день обращения.', rating: 4.5, reviewsCount: 16, completedOrders: 98, responseTime: 'в течение часа', verified: false, topRated: false, exp: 7 },
    { name: 'Наталья Орлова', avatar: '/avatars/m8.png', profession: 'Ландшафтный дизайнер', city: 'Москва', area: 'Москва и область', slug: 'landshaft', priceFrom: 2000, priceTo: 50000, skills: 'проектирование участка,озеленение,благоустройство,система полива', bio: 'Дизайн и благоустройство приусадебных участков. Разработка проектов озеленения, подбор растений, устройство газонов, установка систем автоматического полива.', rating: 4.7, reviewsCount: 12, completedOrders: 34, responseTime: 'в течение 3 часов', verified: false, topRated: false, exp: 9 },
  ];

  const createdMasters: Awaited<ReturnType<typeof db.master.create>>[] = [];
  for (const m of masters) {
    const created = await db.master.create({
      data: {
        name: m.name,
        avatar: m.avatar,
        profession: m.profession,
        city: m.city,
        area: m.area,
        categoryId: catMap[m.slug],
        priceFrom: m.priceFrom,
        priceTo: m.priceTo,
        currency: '₽',
        rating: m.rating,
        reviewsCount: m.reviewsCount,
        completedOrders: m.completedOrders,
        responseTime: m.responseTime,
        verified: m.verified,
        topRated: m.topRated,
        skills: m.skills,
        bio: m.bio,
        experienceYears: m.exp,
      },
    });
    createdMasters.push(created);
  }

  // --- Reviews ---
  const reviewData = [
    { mi: 0, name: 'Алексей К.', rating: 5, text: 'Андрей починил протекающий кран за 30 минут. Очень аккуратный и быстрый мастер. Рекомендую!', pros: 'Быстро, аккуратно', cons: null, job: 'Замена крана на кухне' },
    { mi: 0, name: 'Марина В.', rating: 5, text: 'Вызывали Андрея для замены труб в ванной. Сделал всё качественно, дал гарантию. Цена адекватная.', pros: 'Гарантия, качество', cons: null, job: 'Замена труб в ванной' },
    { mi: 0, name: 'Дмитрий С.', rating: 4, text: 'Хороший мастер, работа выполнена хорошо. Немного задержался на 20 минут, но предупредил заранее.', pros: 'Качество работы', cons: 'Небольшое опоздание', job: 'Установка стиральной машины' },
    { mi: 1, name: 'Ольга П.', rating: 5, text: 'Елена собрала нам электрощиток в новой квартире. Всё по нормам, объяснила каждый автомат. Супер профессионал!', pros: 'Экспертность, объяснения', cons: null, job: 'Сборка электрощитка' },
    { mi: 1, name: 'Игорь Т.', rating: 5, text: 'Заменили всю проводку в однокомнатной квартире. Елена работала быстро и чисто. Очень довольны результатом.', pros: 'Быстро, чисто', cons: null, job: 'Замена проводки' },
    { mi: 2, name: 'Анна М.', rating: 5, text: 'Сергей сделал ремонт в нашей студии за 2 недели. Всё чётко по срокам и смете. Рекомендую бригаду!', pros: 'Соблюдение сроков, смета', cons: null, job: 'Капитальный ремонт студии' },
    { mi: 2, name: 'Павел Д.', rating: 4, text: 'Качество ремонта хорошее, особенно плитка в ванной. Но пришлось немного подождать с началом работ.', pros: 'Отличная плитка', cons: 'Задержка начала работ', job: 'Ремонт ванной комнаты' },
    { mi: 3, name: 'Елена Г.', rating: 5, text: 'Ольга сделала генеральную уборку после ремонта — квартира засияла! Очень thorough (тщательная) работа.', pros: 'Внимание к деталям', cons: null, job: 'Генеральная уборка после ремонта' },
    { mi: 3, name: 'Сергей Л.', rating: 4, text: 'Хорошая уборка, мойка окон на высоте. Единственное — хотелось бы больше внимания к углам.', pros: 'Мойка окон, скорость', cons: 'Углы могли бы чище', job: 'Уборка 3-комнатной квартиры' },
    { mi: 4, name: 'Наталья Р.', rating: 5, text: 'Дмитрий сделал кухню на заказ — просто шедевр! 3D-визуализация точно совпала с результатом. Качество на высоте.', pros: '3D-визуализация, качество', cons: null, job: 'Кухня на заказ' },
    { mi: 4, name: 'Алексей Н.', rating: 5, text: 'Заказывали шкаф-купе. Измерил, спроектировал, установил — всё за 10 дней. Отличная работа!', pros: 'Быстро, точно по размерам', cons: null, job: 'Шкаф-купе в прихожую' },
    { mi: 5, name: 'Ирина Б.', rating: 5, text: 'Максим выровнял стены в ванной идеально! Плитка лёгла как в журнале. Декоративная штукатурка в гостиной — восторг.', pros: 'Идеальные стены, декор', cons: null, job: 'Штукатурка и укладка плитки' },
    { mi: 5, name: 'Виктор К.', rating: 4, text: 'Хороший мастер, шпаклёвка стен без нареканий. Немного пыльно было, но это неизбежно при таких работах.', pros: 'Качество шпаклёвки', cons: 'Много пыли', job: 'Шпаклёвка стен в комнате' },
    { mi: 6, name: 'Татьяна С.', rating: 5, text: 'Игорь починил стиральную машину Bosch за час на дому. Оказалось, просто слетел ремень. Запчасти были с собой.', pros: 'Быстро, запчасти с собой', cons: null, job: 'Ремонт стиральной машины Bosch' },
    { mi: 6, name: 'Андрей В.', rating: 4, text: 'Починил холодильник, но через неделю снова возникла проблема. Пришёл бесплатно и доремонтировал.', pros: 'Пришёл бесплатно', cons: 'Повторная поломка', job: 'Ремонт холодильника Samsung' },
    { mi: 7, name: 'Марина К.', rating: 5, text: 'Наталья разработала потрясающий проект нашего участка! Посадили растения, установили автополив. Сад цветёт!', pros: 'Творческий подход', cons: null, job: 'Ландшафтный дизайн участка' },
    { mi: 7, name: 'Олег Ф.', rating: 4, text: 'Хороший проект, но установка полива заняла больше времени, чем планировалось. Результат отличный.', pros: 'Качественный проект', cons: 'Задержка по срокам', job: 'Благоустройство двора' },
  ];

  for (const r of reviewData) {
    await db.review.create({
      data: {
        masterId: createdMasters[r.mi].id,
        authorName: r.name,
        rating: r.rating,
        text: r.text,
        pros: r.pros,
        cons: r.cons,
        jobTitle: r.job,
      },
    });
  }

  // --- Service Reviews ---
  const serviceReviews = [
    { name: 'Алексей К.', rating: 5, text: 'Удобный сервис! Нашёл сантехника за 5 минут. Мастер пришёл в тот же день.', pros: 'Быстрый поиск, отзывчивые мастера', cons: null },
    { name: 'Мария Л.', rating: 4, text: 'Хороший каталог мастеров, удобные фильтры. AI-подбор реально помогает.', pros: 'AI-подбор, фильтры', cons: 'Хотелось бы больше мастеров' },
    { name: 'Павел Д.', rating: 5, text: 'Отличная платформа! Сделал заявку, мастер перезвонил через 15 минут. Работа выполнена на отлично.', pros: 'Быстрая связь, качество мастеров', cons: null },
    { name: 'Елена С.', rating: 4, text: 'Удобно что можно смотреть отзывы и рейтинги. Выбрала мастера с рейтингом 4.9 — не пожалела!', pros: 'Рейтинги, отзывы', cons: null },
    { name: 'Игорь В.', rating: 5, text: 'Сервис реально экономит время. Раньше искал мастеров через знакомых, теперь всё здесь.', pros: 'Экономия времени', cons: null },
  ];

  for (const sr of serviceReviews) {
    await db.serviceReview.create({
      data: {
        authorName: sr.name,
        rating: sr.rating,
        text: sr.text,
        pros: sr.pros,
        cons: sr.cons,
      },
    });
  }

  console.log('Done! Created:');
  console.log(`  Categories: ${cats.length}`);
  console.log(`  Masters: ${createdMasters.length}`);
  console.log(`  Reviews: ${reviewData.length}`);
  console.log(`  Service reviews: ${serviceReviews.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
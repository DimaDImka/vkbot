const { VK } = require('vk-io');
const vk = new VK();
const users = require('./users.json')
const fs = require('fs');
vk.setOptions({
token:"7cd89b118d6b2989273a0d7e3773aca5c776335a2da947b247fb32c13c1dd3abec022e639aba93d7f90d4"
});


const works = [
  {
    name: 'Дворник',
    id: 1,
    money: 1000
  },
  {
    name: 'Кассир',
    id: 2,
    money: 2000
  },
  {
    name: 'Таксист',
    id: 3,
    money: 5000
  },
  {
    name: 'Программист',
    id: 4,
    money: 7500
  }
]

const utils = {
  gi: (int) => {
    int = int.toString();
    let text = ``;
    for (let i = 0; i < int.length; i++)
    {
      text += `${int[i]}&#8419;`;
    }
    return text;
  },
  random: (x, y) => {
    return y ? Math.round(Math.random() * (y - x)) + x : Math.round(Math.random() * x);
  },
  pick: (array) => {
    return array[utils.random(array.length - 1)];
      }
}

function timeLeft(stamp) {
  stamp -= Date.now()
  stamp = stamp / 1000;
  let s = stamp % 60;
  stamp = ( stamp - s ) / 60;
  let m = stamp % 60;
  stamp = ( stamp - m ) / 60;
  let h = ( stamp ) % 24;
  let d = ( stamp - h ) / 24;
  let text = ``;
  if(d > 0) text += Math.floor(d) + " д. ";
  if(h > 0) text += Math.floor(h) + " ч. ";
  if(m > 0) text += Math.floor(m) + " мин. ";
  if(s > 0) text += Math.floor(s) + " с.";
  return text;
}

setInterval(async () => {
    fs.writeFileSync("./users.json", JSON.stringify(users, null, "\t"))
}, 500);

function prettify(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
vk.updates.on(['new_message'], async (next, context) => {
  if(users.filter(x => x.id === next.senderId)[0]) return context()
  const [info] = await vk.api.users.get({ user_ids: next.senderId, fields: 'domain' })
  users.push({
    id: next.senderId,
    balance: 5000,
    inventory: [],
    work: {
      timer: 0,
      name: 'Нет',
      id: 0,
      day: 0
    },
    nick: 'Игрок',
    link: 'https://vk.com/' + info.domain,
    domain: info.domain,
    bonus: 0,
    adm: false,
    moderator: false
  })
  return context()
})

vk.updates.hear(/^проф/i, msg => {
  user = users.filter(x => x.id === msg.senderId)[0]
  var text = ''
  if(user.moderator) text += `Модератор`
  if(user.adm) text += `👑 Администратор`
  msg.send(`${user.nick}, вот твой профиль:\nБаланс: ${prettify(user.balance)}$\nРабота: ${user.work.name}\n${text}`)
})

vk.updates.hear(/^работы$/i, msg => {
  user = users.filter(x => x.id === msg.senderId)[0]
  msg.send(`${user.nick}, вот все доступные работы:\n1. Дворник [1.000]\n2. Кассир [2.000]\n3. Таксист [5.000]\n\nЧтобы устроиться на работу, введи: "Работа [номер работы]"`)
})

vk.updates.hear(/^адм ?(.*)?/i, msg => {
  if(msg.senderId != 170182571) return
  if(msg.hasReplyMessage){
    const user = users.filter(x => x.id == msg.replyMessage.senderId)[0]
    user.adm = true
    msg.send(`Пользователю выдана админка!`)
    return
  }
  if(msg.text.match(/\[id(.*)\|(.*)\]/i)){
    const user = users.filter(x => x.id == Number(msg.text.split('[id')[1].split('|')[0]))[0]
    user.adm = true
    msg.send(`Пользователю выдана админка!`)
    return
  }
  if(msg.text.match(/https:\/\/vk.com\/(.*)/i)){
    console.log(msg.text.split('https://vk.com/')[1]);
    var user = users.filter(x => x.domain == msg.text.split('https://vk.com/')[1])[0]
    if(!user) user = users.filter(x => x.id == Number(msg.text.split('https://vk.com/id')[1]))[0]
    user.adm = true
    msg.send(`Пользователю выдана админка!`)
    return
  }
})
vk.updates.hear(/^мод ?(.*)?/i, msg => {
  if(msg.senderId != 170182571) return
  if(msg.hasReplyMessage){
    const user = users.filter(x => x.id == msg.replyMessage.senderId)[0]
    user.moderator = true
    msg.send(`Пользователю выдана модераторские права!`)
    return
  }
  if(msg.text.match(/\[id(.*)\|(.*)\]/i)){
    const user = users.filter(x => x.id == Number(msg.text.split('[id')[1].split('|')[0]))[0]
    user.moderator = true
    msg.send(`Пользователю выдана модераторские права!`)
    return
  }
  if(msg.text.match(/https:\/\/vk.com\/(.*)/i)){
    console.log(msg.text.split('https://vk.com/')[1]);
    var user = users.filter(x => x.domain == msg.text.split('https://vk.com/')[1])[0]
    if(!user) user = users.filter(x => x.id == Number(msg.text.split('https://vk.com/id')[1]))[0]
    user.moderator = true
    msg.send(`Пользователю выдана модераторские права!`)
    return
  }
})
vk.updates.hear(/^(?:ставка)\s(.*)$/i, (msg, bot) => {

  let image = '';
  user = users.filter(x => x.id === msg.senderId)[0]

  msg.$match[1] = msg.$match[1].replace(/(\.|\,)/ig, '');
	msg.$match[1] = msg.$match[1].replace(/(к|k)/ig, '000');
	msg.$match[1] = msg.$match[1].replace(/(м|m)/ig, '000000');
	msg.$match[1] = msg.$match[1].replace(/(вабанк|вобанк|все|всё|вб)/ig, user.balance);


  if(!Number(msg.$match[1])) return;
	msg.$match[1] = Math.floor(Number(msg.$match[1]));

	if(msg.$match[1] <= 0) return;

  

	if(msg.$match[1] > user.balance) msg.send(`На вашем счету нету такой суммы.`);
	else if(msg.$match[1] <= user.balance)
	{
		
		user.balance -= msg.$match[1];
		// 0.50, 0.75, 2, 1, 5, 0, 0, 0, 0.70, 0.5, 2, 1, 0.90, 1, 0, 0, 0.54, 0.1, 2, 0
		const multiply = utils.pick([0, 0, 0, 2, 5, 50]);
		
		user.balance += Math.floor(msg.$match[1] * multiply);
		switch (multiply) {
      case 2:
        image = 'photo-206025556_457239019';
        break;
      case 5:
        image = 'photo-206025556_457239020';
        break;
      case 50:
        image = 'photo-206025556_457239021';
        break;
      case 0:
        image = 'photo-206025556_457239022';
        break;
      }
    
    msg.send({message: `${multiply === 1 ? `😧 Ого, везет вам сегодня, ваши деньги остаются при вас` : `${multiply < 1 ? `👺 Увы, но вы проиграли ${msg.$match[1]}💲` : `😇 Ваш выйгрыш ${msg.$match[1] * multiply}💲`}`}`, attachment: image});
  }
})

vk.updates.hear(/^(?:топ баланс)$/i, msg => {
  var idAndBalance = new Map();
  let textTop = "";

  for (var user in users) {
    console.log(users[1].id)
    idAndBalance.set(users[user].id, Math.floor(users[user].balance))
  }
  console.log(idAndBalance);

  const sortedIdAndBalance = new Map([...idAndBalance.entries()].sort().reverse());

  for (let pair of sortedIdAndBalance) {
    textTop = textTop + "@id" + String(pair).replace(",", " ") + "$\n";
  }

  msg.send( "Топ по балансу: \n" + textTop);

})


vk.updates.hear(/^выдать (.*) (.*)/i, msg => {
  const u = users.filter(x => x.id === msg.senderId)[0]
  if(!u.adm) return
  console.log(msg.$match);
  if(msg.$match[1].match(/\[id(.*)\|(.*)\]/i)){
    var user = users.filter(x => x.id == Number(msg.$match[1].split('[id')[1].split('|')[0]))[0]
  } else {
    user = users.filter(x => x.domain == msg.$match[1].split('https://vk.com/')[1])[0]
    if(!user) user = users.filter(x => x.id == Number(msg.$match[1].split('https://vk.com/id')[1]))[0]
  }
  if(!user) return msg.send(`Пользователь не найден!`)
  var money = msg.$match[2]
  money = Number(money.replace(/(k|к)/ig, '000'))
  if(!money) return msg.send(`Невалидная сумма!`)
  user.balance += money
  msg.send(`Вы выдали игроку "${user.nick}" ${prettify(money)}$`)
})

vk.updates.hear(/^гет ?(.*)?/i, msg => {
  if(msg.hasReplyMessage){
    const user = users.filter(x => x.id == msg.replyMessage.senderId)[0]
    var text = ''
    if(user.adm) text += `👑 Администратор`
    if(user.moderator) text += `Модератор`
    msg.send(`Профиль игрока ${user.nick}:\nБаланс: ${prettify(user.balance)}$\nРабота: ${user.work.name}\n${text}`)
    return
  }
  if(msg.text.match(/\[id(.*)\|(.*)\]/i)){
    const user = users.filter(x => x.id == Number(msg.text.split('[id')[1].split('|')[0]))[0]
    var text = ''
    if(user.adm) text += `👑 Администратор`
    msg.send(`Профиль игрока ${user.nick}:\nБаланс: ${prettify(user.balance)}$\nРабота: ${user.work.name}\n${text}`)
    return
  }
  if(msg.text.match(/\[id(.*)\|(.*)\]/i)){
    const user = users.filter(x => x.id == Number(msg.text.split('[id')[1].split('|')[0]))[0]
    var text = ''
    if(user.moderator) text += `Модератор`
    msg.send(`Профиль игрока ${user.nick}:\nБаланс: ${prettify(user.balance)}$\nРабота: ${user.work.name}\n${text}`)
    return
  }
  if(msg.text.match(/https:\/\/vk.com\/(.*)/i)){
    console.log(msg.text.split('https://vk.com/')[1]);
    var user = users.filter(x => x.domain == msg.text.split('https://vk.com/')[1])[0]
    if(!user) user = users.filter(x => x.id == Number(msg.text.split('https://vk.com/id')[1]))[0]
    var text = ''
    if(user.adm) text += `👑 Администратор`
    msg.send(`Профиль игрока ${user.nick}:\nБаланс: ${prettify(user.balance)}$\nРабота: ${user.work.name}\n${text}`)
    return
  }
})

vk.updates.hear(/бонус/i, msg => {
  const user = users.filter(x => x.id === msg.senderId)[0]
  if(user.bonus > Date.now()) return msg.send(`${user.nick}, ты сможешь получить бонус через: ${timeLeft(user.bonus)}`)
  const bonus = utils.random(5000, 10000)
  user.balance += bonus
  msg.send(`${user.nick}, вы выиграли ${bonus}$`)
  user.bonus = Date.now() + 120000
})

vk.updates.hear(/^работа ([0-9]+)/i, msg => {
  user = users.filter(x => x.id === msg.senderId)[0]
  num = Number(msg.$match[1])
  if(num > 4 || num < 1) return msg.send(`Неверный номер работы!`)
  work = works.filter(x => x.id === num)[0]
  user.work.name = work.name
  user.work.id = work.id
  msg.send(`${user.nick}, вы устроились на работу "${work.name}"`)
})

vk.updates.hear(/^работать$/i, msg => {
  user = users.filter(x => x.id === msg.senderId)[0]
  if(user.work.timer > Date.now()) return msg.send(`${user.nick}, вы отработали неделю, осталось отдыхать: ${timeLeft(user.work.timer)}`)
  user.work.day++
  work = works.filter(x => x.id === user.work.id)[0]
  if(user.work.day == 5){
    user.work.day = 0
    user.work.timer = Date.now() + 60000
  }
  user.balance += work.money
  msg.send(`${user.nick}, рабочий день завершен, вы заработали: ${work.money}`)
})
vk.updates.hear(/^ник (.*)/i, msg => {
  user = users.filter(x => x.id === msg.senderId)[0]
  nick = msg.$match[1]
  if(nick.length > 15) return msg.send(`Ник не может быть длиннее 15 символов!`)
  user.nick = nick
  msg.send(`Вы сменили никнейм на "${nick}"`)
})
vk.updates.hear(/^купить (.*)/i, msg => {
  const parts = text.split(' ');
  if (parts.length !== 3) {
    context.send('Использование: купить <название товара> <цена>');
    return;
  }

  const itemName = parts[1];
  const price = parseInt(parts[2]);

  if (isNaN(price)) {
    context.send('Цена должна быть числом');
    return;
  }

  const item = { name: itemName, price: price, id: Math.random().toString(36).substr(2, 9) };
  const success = buyItem(userId, item.id, item.price);

  if (success) {
    context.send(`Вы купили "${item.name}" за ${item.price} монет`);
  } else {
    context.send(`У вас недостаточно средств для покупки "${item.name}"`);
  }
});
console.log("ok");
vk.updates.start().catch(console.error);

/*
v1 create
v2 ealyload 
v3 if same src is silent
v4 paste check
*/

var fn={}
fn.q=d=>document.querySelector(d)
fn.isimg=function isimg(line){
  const re= /\.(jpeg|jpg|png|bmp|gif|webp|avif)$/i
  return re.test(line)
}
fn.rword=(l=8)=>{
  const c = "abcdefghijklmnopqrstuvwxyz0123456789"
  const cl=c.length
  var r = "";
  for(var i=0; i<l; i++){
    r += c[Math.floor(Math.random()*cl)];
  }
  return r;
}

fn.earlyload=(src)=>{return new Promise(sol=>{  
  const img = new Image()
  img.onload =()=>sol(src)
  img.src=src  
})}


class yagateou{
  def_img = 'https://i.pinimg.com/564x/1c/1d/01/1c1d0124119724454a8cfc40ce2f8071.jpg';
  keep;
  constructor(data,keep){
    this.id = fn.rword()
    this.keep = !!keep
    this.make()
    this.setData(data)
    this.checkTitle()
    this.checkImg()
    
    this.init()
  }
  async init(){
    
    const {Press} = await import( "//hashsan.github.io/EditorFrame/EditorFrame.js")
    new Press(this.ed).press('*',(e)=>{
      //console.log('in')
      this.checkTitle()
      this.checkImg()
    },300).press('ctrl+Backspace',()=>{
      if(!this.isRemove()){
        return
      }
      this.remove()      
    }).press('ctrl+Enter',()=>this.appendSib(new yagateou().frame))
   .press('ctrl+v',(e)=>{
     //v4 paste is check
      this.checkTitle()     
      this.checkImg()  
  },300)
    

  }
  make(){
    var temp=`
  <div id="${this.id}" class="yagateou frame">
    <div class="bar">head</div>
    <img class="shield" src="${this.def_img}">
    <div class="body" contenteditable="plaintext-only"></div>
  </div>
`
    var el = document.createElement('div')
    el.innerHTML = temp
    el = el.children[0];

    this.frame = el
    this.head = el.children[0]
    this.img = el.children[1];
    this.ed = el.children[2];
  }
  async checkTitle(){
    const data = this.getData()
    var title = data.split('\n').at(0)
    this.head.innerText = title
    this.ed.dataset.title = title
  }
  async checkImg(){
    const data = this.getData()
    //console.log(data.split('\n'))
    var src=data.split('\n').filter(d=>fn.isimg(d)).at(0)
    //console.log(src)
    //v3 same src is silent
    src = src || this.def_img
    if(this.img.src === src){
      return
    }

    //v2
    fn.earlyload(src).then(d=>{
      this.img.src=src
    })    
    
    //this.img.src = src||this.def_img
    //console.log(this.img.src)    
  }
  setData=(data)=>{
    //console.log(data)
    this.ed.innerHTML = data||'＃＃新'
  }
  getData=()=>{
    return this.ed.innerText;
  }
  isRemove(){
    if(this.keep){
      return false;
    }
    if(!(this.ed.innerText ==='')){
      return false;
    }
    return true;    
  }
  remove(){
    this.frame.remove();
  }    
  appendSib(el,base){
    base = base||this.frame
    return base.parentElement
      .insertBefore(el,base.nextElementSibling)
  }  
}


/////////////////////////////////
/////////////////////////////////
/*
v1 create
v2 saveMissBlock
v3 loading with bar moving
v4 saveMissBlock retry
v5 nav timing input
v6 infinity the kaigyou
v6.1 trigger miss repair
v7 menu to nav, top and bottom
*/


export class yagateouSite{
  target =fn.q('article')
  bar
  constructor(){

    this.init()
  }

  async init(){

    this.api = await getApi()
       
    const {Bar} = await import('https://hashsan.github.io/Bar/Bar.js?v=2')
    var bar = new Bar()
    bar.bar.style.position='fixed';
    this.bar = bar;

    //v3
    bar.go(50)
    await this.load()     
    bar.go(100)
    
    
    //console.log(this.bar)
    const {Press} = await import( "//hashsan.github.io/EditorFrame/EditorFrame.js")

    new Press(document.documentElement)
      .press('ctrl+s',(e)=>{
      e.preventDefault()
      bar.go(30)     
      this.save().then(d=>bar.go(100))
    })
      //.press('Enter',(e)=>this.makeNav()) //v5
      .press('*',(e)=>{
        this.makeNav() //v5
        bar.go(10)
      },500)

    //v2
    this.saveMissBlock()    

    this.makeNav()
  }
  async makeNav(){
    const html = this.getEditors()
    .map(d=>`<a href="#${d.parentElement.id}">${d.dataset.title}</a>`)
    .join('\n')
    //fn.q('footer').innerHTML = html;  //v7
    fn.q('nav.top').innerHTML = html;
    fn.q('nav.bottom').innerHTML = html;
  }
  getEditors(){
    return  Array.from(this.target.querySelectorAll('.body'))    
  }
  getData=()=>{    
    return this.getEditors().map(d=>d.innerText).join('\n')
  }

  async load(){
    var data = await this.api.load()||'＃＃新規ファイル'
    var first = true
    for(let d of lip(data)){
      const ya = new yagateou(d,first)
      first = false
      fn.q('article').append(ya.frame)
    }
    //

  }
  save(){
    return this.api.save(this.getData())
  }
  saveMissBlock(){
    const bar = this.bar
    window.onbeforeunload = (e) =>{ //v4
      if(bar.getValue() === 0){
        return
      }
      e.returnValue = "行った変更が保存されません。よろしいですか？";
    }  
  }  
  
//
}

function lip(data){
  const br='\n'
  let dat =''
  let ary=[]
  for(const line of data.split('\n')){
    if(/^＃/.test(line) && dat){
      //ary.push(dat)
      ary.push( dat.trim() )  //v6 add trim()      
      dat=''
    }
    dat += line + br
  }
  if(dat){
    ary.push( dat.trim() )  //v6 add trim()
  }
  return ary
}    

function clearurl(url){  
  const {origin,pathname} = new URL(url)
  return origin + pathname  
}
function getGhp(){
  var d = "ghp_"
  /**/
  + "9ah8c3yojjO"
  + "EsWBOP6CSiMAMj"
  + "mcDcF1UGrhv"    
  return d;
}
function isGithub(url){
  return /\.github\.io/.test(url)
}
function getUrl(){
  const def ='https://hashsan.github.io/outputs/cache.html'
  var u = clearurl(location.href)
  u = isGithub(u)?u:def 
  u=u.replace(/.html$/,'.txt')
  return u
}

async function getApi(){  
  const {Octo} = await import('https://hashsan.github.io/Octo/Octo.js');  
  const url = getUrl()
  const ghp = getGhp()
  const api = new Octo(url,ghp)
  return api;
}

/////////////////////////////////




//var ya = new yagateouSite()

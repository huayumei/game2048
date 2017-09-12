var game={
	data:[],//保存n行n列的二维数组
	RN:4,//总行数
	CN:4,//总列数
	score:0,//游戏分数
	top1:0,//游戏最高分
	GAMEOVER:0,//结束状态
	RUNNING:1,//运行状态
	state:1,//游戏当前状态
	MARGIN:16,//每个格的间隙
	CSIZE:100,//每个格的尺寸
	//游戏开始
	start:function(){
		//外层循环控制r,从0开始到RN-1结束
		//初始化data为[]
		//this.data=[];
		var div=document.getElementById("gridPanel");
		div.innerHTML=this.getInnerHTML();
		div.style.width=this.CN*this.CSIZE+this.MARGIN*(this.CN+1)+'px';
		div.style.height=this.RN*this.CSIZE+this.MARGIN*(this.RN+1)+'px';

		for(var r=0;r<this.RN;r++){
			this.data.push([]);//向data中压入一个[]
			//内层循环控制c,从0开始到CN-1结束
			for(var c=0;c<this.CN;c++){
				this.data[r][c]=0;//设置data中r行c列的元素为0
			}
		}
		this.score=0;//重置分数
		this.top1=this.getTop();//从cookie读取最高分
		this.state=this.RUNNING;//初始化游戏状态为运行
		//调用randomNum方法生成两个随机数
		this.randomNum();
		this.randomNum();
		this.updataView();

		var me=this;//留在this

		//为当前网页绑定键盘按下事件
		document.onkeydown=function(){
			if(this.state==this.RUNNING){
				var e=window.event||arguments[0];
				switch(e.keyCode){
					case 37:me.moveLeft();break;
					case 39:me.moveRight();break;
					case 38:me.moveUp();break;
					case 40:me.moveDown();break;
				}
			}
		}
	},
	//获得cookie中的最高分
	getTop:function(){
		var cookies=document.cookie.split("; ");
		for(var i=0;i<cookies.length;i++){
			var kv=cookies[i].split("=");
			cookies[kv[0]]=kv[1];
		}
		return cookies["top1"]||0;
	},
	//将当前游戏的分数保存到cookie
	setTop:function(){
		var now=new Date();
		now.setFullYear(now.getFullYear()+10);
		document.cookie="top1="+this.score+";expires"+now.toGMTString();
	},
	getInnerHTML:function(){
		var arr=[];
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				arr.push(""+r+c);
			}
		}
		var html='<div id="g'+arr.join('" class="grid"></div><div id="g')+'" class="grid"></div>';
		html+='<div id="c'+arr.join('" class="cell"></div><div id="c')+'" class="cell"></div>';
		//console.log(html);
		return html;
	},
	//将Data中数据更新到页面
	updataView:function(){
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				var div=document.getElementById("c"+r+c);
				if(this.data[r][c]){
					div.innerHTML=this.data[r][c];
					div.className="cell n"+this.data[r][c];
				}else{
					div.innerHTML="";
					div.className="cell"; 
				}
			}
		}
		//将游戏的分数显示在屏幕上
		document.getElementById("score").innerHTML=this.score;
		var div=document.getElementById("gameOver");
		if(this.state==this.RUNNING){
			div.style.display="none";
		}else{
			div.style.display="block";
			document.getElementById("final").innerHTML=this.score;
		}
		//将游戏的最高分显示在屏幕上
		document.getElementById("top").innerHTML=this.top1;
	},
	//在随机空白位置生成2或4
	randomNum:function(){
		for(;;){
			//在0到RN-1中间生成一个随机整数r
			var r=parseInt(Math.random()*this.RN);
			//在0到CN-1中间生成一个随机整数c
			var c=parseInt(Math.random()*this.CN);
			//如果data中r行c列的值为0
			if(!this.data[r][c]){
				//生成随机数，如果<0.5，就设置data的r行c列的值为2，否则就设置为4
				this.data[r][c]=Math.random()<0.5?2:4;
				break;
			}
		}
	},
	isGameOver:function(){
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				if(!this.data[r][c]){
					return false;
				}else if(this.data[r][c]==this.data[r][c+1]&&c!=this.CN-1){
					return false;
				}else if(r!=this.RN-1&&this.data[r][c]==this.data[r+1][c]){
					return false; 
				}
			}
		}
		return true;
	},
	//左移所有行
	move:function(iterator){
		var before=String(this.data);
		iterator.call(this);
		var after=String(this.data);
		if(before!=after){
			animation.start(function(){
				this.randomNum();
				if(this.isGameOver()){
					this.state=this.GAMEOVER;
					this.score>this.top1&&this.setTop();
				}
				this.updataView();
			}.bind(this));
		}
	},
	moveLeft:function(){
		this.move(function(){
			for(var r=0;r<this.RN;r++){
				this.moveLeftInRow(r);
			}
		});
	},
	//左移第r行
	moveLeftInRow:function(r){
		for(var c=0;c<this.CN-1;c++){
			var nextc=this.getNextInRow(r,c);
			if(nextc==-1){
				break;
			}else if(!this.data[r][c]){
				this.data[r][c]=this.data[r][nextc];
				this.data[r][nextc]=0;
				//找到rc位置的div,加入要移动的任务
				animation.addTask(document.getElementById("c"+r+nextc),r,nextc, r,c);
				c--;
			}else if(this.data[r][c]==this.data[r][nextc]){
				this.score+=this.data[r][c]*=2;
				this.data[r][nextc]=0;
				animation.addTask(document.getElementById("c"+r+nextc),r,nextc, r,c);
			}
		}
	},
	//查找c之后下一个不为0的位置
	getNextInRow:function(r,c){
		for(var nextc=c+1;nextc<this.CN;nextc++){
			if(this.data[r][nextc]){
				return nextc;
			}
		}
		return -1;
	},
	//右移所有行
	moveRight:function(){
		this.move(function(){
			for(var r=0;r<this.RN;r++){
				this.moveRightInRow(r);
			}
		});
	},
	//右移第r行
	moveRightInRow:function(r){
		for(var c=this.CN-1;c>0;c--){
			var prevc=this.getPrevInRow(r,c);
			if(prevc==-1){
				break;
			}else if(!this.data[r][c]){
				this.data[r][c]=this.data[r][prevc];
				this.data[r][prevc]=0;
				//找到rc位置的div,加入要移动的任务
				animation.addTask(document.getElementById("c"+r+prevc),r,prevc, r,c);
				c++;
			}else if(this.data[r][c]==this.data[r][prevc]){
				this.score+=this.data[r][c]*=2;
				this.data[r][prevc]=0;
				animation.addTask(document.getElementById("c"+r+prevc),r,prevc, r,c);
			}
		}
	},
	//查找c之前的上一个不为0的位置
	getPrevInRow:function(r,c){
		for(var prevc=c-1;prevc>=0;prevc--){
			if(this.data[r][prevc]){
				return prevc;
			}
		}
		return -1;
	},
	//上移所有行
	moveUp:function(){
		this.move(function(){
			for(var c=0;c<this.CN;c++){
				this.moveUpInRow(c);
			}
		});
	},
	//上移第r行
	moveUpInRow:function(c){
		for(var r=0;r<this.RN-1;r++){
			var nextr=this.getUpInCol(r,c);
			if(nextr==-1){
				break;
			}else if(!this.data[r][c]){
				this.data[r][c]=this.data[nextr][c];
				this.data[nextr][c]=0;
				//找到rc位置的div,加入要移动的任务
				animation.addTask(document.getElementById("c"+nextr+c),nextr,c, r,c);
				r--;
			}else if(this.data[r][c]==this.data[nextr][c]){
				this.score+=this.data[r][c]*=2;
				this.data[nextr][c]=0;
				animation.addTask(document.getElementById("c"+nextr+c),nextr,c, r,c);
			}
		}
	},
	//查找r之上上一个不为0的位置
	getUpInCol:function(r,c){
		for(var nextr=r+1;nextr<this.RN;nextr++){
			if(this.data[nextr][c]){
				return nextr;
			}
		}
		return -1;
	},
	//下移所有行
	moveDown:function(){
		this.move(function(){
			for(var c=0;c<this.CN;c++){
				this.moveDownInRow(c);
			}
		});
	},
	//下移第r行
	moveDownInRow:function(c){
		for(var r=this.RN-1;r>0;r--){
			var prevr=this.getDownInCol(r,c);
			if(prevr==-1){
				break;
			}else if(!this.data[r][c]){
				this.data[r][c]=this.data[prevr][c];
				this.data[prevr][c]=0;
				//找到rc位置的div,加入要移动的任务
				animation.addTask(document.getElementById("c"+prevr+c),prevr,c, r,c);
				r++;
			}else if(this.data[r][c]==this.data[prevr][c]){
				this.score+=this.data[r][c]*=2;
				this.data[prevr][c]=0;
				animation.addTask(document.getElementById("c"+prevr+c),prevr,c, r,c);
			}
		}
	},
	//查找r之下下一个不为0的位置
	getDownInCol:function(r,c){
		for(var prevr=r-1;prevr>=0;prevr--){
			if(this.data[prevr][c]){
				return prevr;
			}
		}
		return -1;
	}
	
}
window.onload=function(){
	game.getInnerHTML();
	game.start();
}
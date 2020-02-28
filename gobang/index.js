// 封装 Gobang 类
var Gobang = (function() {

    // 定义私有变量 roundDirectArr
    var arr = [1,-1,0]
    var roundDirectArr = []
    arr.forEach(v => roundDirectArr.push([v, 1]))
    roundDirectArr.push([-1,0])


    // 一条轴上的赢法数组(0-8,共9个点)
    var makWins = function() {
        var shaftWins = []
        for (let i = 0; i < 5; i++) {
            shaftWins[i] = []
            for (let j = i+1; j < i+5; j++) {
                shaftWins[i][j] = true
            }
        }
        return shaftWins
    }


    // 定义 Gobang 的方法集
    class GobangUtil {

        // 返回每个方向连续的颜色值相同的棋子数
        getDirectSameColorNum(x, y, direct) {
            var board = this.board 
            var result = 0
            var activeColor = board[x][y]

            for (var i = 1; i < 5; i++) {
                var nextColor = board[x + i * direct[0]][y + i * direct[1]]
                if (activeColor == nextColor) { result++ } else {break}
            }
            
            return result
        }
        
        // 判断单个轴连续的总相连棋子数
        getSingleDirect(x, y, direct) {
            var board = this.board 
            var leftDirect = direct
            var rightDirect = direct.map(v=>-v)
            var getNum = this.getDirectSameColorNum.bind(this, x, y)

            return getNum(leftDirect) + getNum(rightDirect)
        }

        // 判断 4 个轴的是否有一个连成5子
        checkRoundDirect(x, y, roundDirect) {
            var board = this.board 
            return roundDirect.some(direct => this.getSingleDirect(x, y, direct) >= 4)
        }

        // 获取 4 个轴的总分数
        getRoundScore(x, y, roundDirect, scoreArr) {
            var board = this.board 
            var result = 0
            roundDirect.forEach(direct => {
                // var pieces = this.getSingleDirect(x, y, direct)
                result += this.getShaftScore(x, y, direct, scoreArr)
            })
            
            return result
        }

        // 获取单个轴分数
        getShaftScore(x, y, direct, scoreArr) {
            var that = this
            var board = this.board 
            var score = 0
            var leftDirect = direct
            var rightDirect = direct.map(v=>-v)

            var shaftWins = makWins()

            var getArr = that.getDirectSameColorNumAble.bind(this, x, y)
            var leftArr = getArr(leftDirect)
            var rightArr = getArr(rightDirect).map(v=>v+4)
            var shaftArr = leftArr.concat(rightArr)
            // console.log(shaftArr)
            shaftWins.forEach(v => {
                let count = 0
                shaftArr.forEach(j => v[j] && count++)
                if(count > 0) {
                    console.log(count)
                    score += scoreArr[count - 1]
                }
            })
            
            return score
        }

        // 返回每个方向可相连的颜色值相同的棋子位置
        getDirectSameColorNumAble (x, y, direct) {
            var board = this.board 
            var result = []
            var activeColor = board[x][y]

            for (var i = 1; i < 5; i++) {
                var nextColor = board[x + i * direct[0]][y + i * direct[1]]
                if (activeColor == nextColor) { 
                    result.push(i)
                } else if(nextColor !== 0) {
                    break
                }
            }
            
            return result
        }
    }

    // 定义 Gobang
    class Gobang extends GobangUtil {
        constructor(num, callback){
            super()
            //已下的棋盘上的坐标集合
            var board = new Proxy(this.mk2dArr(num,0),{
                get: function(target, property) {
                    if (property in target) {
                        return target[property];
                    } else {
                        return [...Array(num)].fill(0)
                    }
                }
            })


            this.board = board
            this.manScore = this.mk2dArr(num,0) 
            this.computerScore = this.mk2dArr(num,0)
            
            this.callback = callback
            this.playChess = this.playChess.bind(this)
        }

        playChess(x, y, colorNumber) {
            var {board, callback} = this
            // 给棋盘该坐标赋值
            board[x][y] = colorNumber

            var isWin = super.checkRoundDirect(x, y, roundDirectArr)
            isWin ?  callback.end(colorNumber) : callback.keep(colorNumber,x,y, this)
        }

        // 创建一个二维数组
        mk2dArr(num,inner) {
            var arr = []
            for (var i = 0; i < num; i++) {
                arr[i] =[]
                for (var j = 0; j < num; j++) {
                    arr[i][j] = 0
                }
            }
            return arr 
        }

        // 获取到棋盘上分数最高的点
        getHeighestCoord(colorNumber, callback) {
            var { board, manScore, computerScore} = this

            var max = 0
            var udot=0, vdot=0

            // 遍历所有未下的坐标，给每个坐标评分，并将最高分赋给 score
            board.forEach((v, x) => v.forEach((e, y) => {
                
                if(e === 0) {
                    
                    // 人类颜色的该点分数
                    board[x][y] = 3 - colorNumber
                    manScore[x][y] = super.getRoundScore(x, y, roundDirectArr, [200,400,2000,10000])
                    board[x][y] = 0

                    // 电脑颜色该的点得分
                    board[x][y] = colorNumber
                    computerScore[x][y] = super.getRoundScore(x, y, roundDirectArr,[220,420,2100,20000])
                    board[x][y] = 0

                    
                    if(manScore[x][y] > max) {
                        max = manScore[x][y]
                        udot = x, vdot = y
                    } else if(manScore[x][y] == max && computerScore[x][y] > computerScore[udot][vdot]) {
                        udot = x, vdot = y
                    }


                    if(computerScore[x][y] > max) {
                        max = computerScore[x][y]
                        udot = x, vdot = y
                    } else if(computerScore[x][y] == max && manScore[x][y] > manScore[udot][vdot]) {
                        udot = x, vdot = y
                    }
                } else {
                    // console.log('s', x, y)
                }
                
            }))
            console.log(max)
            callback(udot, vdot)
        }
    }

    return Gobang
})()





var Game = (function() {
    var chessColor = 2
    var isWin = false
    var ele = document.getElementById('root')

    function instantGobang(num, onEnd, onKeep) {
        // 生成 Gobang 实例，定义游戏结束与继续事件
        return new Gobang(num, {
            end(color) {
                onEnd(color)
                isWin = true
            },
            keep(color, x, y, gobang) {
                onKeep(color, x, y, gobang)
            }
        })
    }

    function renderTpl(num) {
        var tpl, 
            coordArr = [], 
            htm = '',
            arr = [...Array(num).keys()]

            rwidth = ele.clientWidth
            swidth = parseInt((rwidth/num), 10) + 'px'
            cwidth = parseInt((rwidth/num/1.2), 10) + 'px'

        tpl= (coord, color) => ( `
            <div class="square" style="width:${swidth};height:${swidth}">
                <div class="circle ${color ? color : ''}" data-coord="${coord}" style="width:${cwidth};height:${cwidth}"></div>
            </div>
        `)

        arr.forEach(v => arr.forEach(e => htm += tpl([e,v])))

        return htm
    }

    function renderHtm (tpl) {
        ele.innerHTML = tpl
    }

    function handleAutoPress(mygobang) {
        return function(colorNumber) {
            mygobang.getHeighestCoord(colorNumber, (x, y)=> {
                var circle = ele.getElementsByClassName('circle')

                for (var i = 0; i < circle.length; i++) { 
                    var coord = circle[i].getAttribute("data-coord"); 
                    if ( coord == `${x},${y}` ) { 
                        circle[i].classList.add(colorNumber == 1 ? 'white' : 'black')
                        // grab the data 
                    }
                }

                chessColor = colorNumber
                mygobang.playChess(x, y, colorNumber)
                
            })    
        }
    }

    function bindEvent(mygobang) {
        ele.addEventListener('click', (e)=> {
            if(isWin) {
                return
            }
            var target = e.target
            if (target.className.includes('circle') && target.classList.length == 1) {
                chessColor = 3 - chessColor
                var coord = target.getAttribute('data-coord').split(',')
                target.classList.add(chessColor == 1 ? 'white' : 'black')
                mygobang.playChess(+coord[0], +coord[1], chessColor)
            }
        })
    }  

   

    return {
        start(num, {onEnd, onKeep}) {
            var that = this
            // 渲染棋盘
            renderHtm(renderTpl(num))
            // 生成 gobang 实例
            mygobang = instantGobang(num, onEnd, onKeep)
            // 并绑定事件
            bindEvent(mygobang)   
        },
        autoPress: handleAutoPress

    }
})()


// var AI = (function(){
//     var boardwidth
//     var board = []
//     var count = 0
//     var wins = []
//     var manWin = []
//     var computerWin = []
//     var manScore = []
//     var computerScore = []
//     var max = 0
//     var u = 0, v = 0

//     // 返回二维数组的方法
//     function mk2dArr(num,inner) {
//         return [...Array(num)]
//                 .fill(
//                     [...Array(num)].fill(inner)
//                 )
//     }

//     // 根据已有棋子数返回分数值的方法
//     function getSigleScore(pieces){
//         var result 
//         switch (pieces) {
//             case 1: 
//                 result = 200 
//                 break
//             case 2: 
//                 result = 400 
//                 break
//             case 3: r
//                 esult = 2000 
//                 break
//             case 4: re
//                 sult = 10000 
//                 break
//         }

//         return result
//     }

//     function initAI(num) {        
//         //初始化棋盘宽度
//         boardwidth = num

//         // 初始化棋盘坐标数组，二维数组，形如 [[0],[0]...]
//         board = mk2dArr(num,0)

//         // 初始化分数坐标数组，内容意为每个坐标的分数,初始形为 [[0],[0]...]
//         manScore = mk2dArr(num,0)
//         computerScore = mk2dArr(num,0)

//         // 初始化赢法的坐标数组，三维数组，形如 [[[]],[[]]...]
//         wins = mk2dArr(num,[])

        
        
//         // 填充竖向,竖向每连续 5 个的坐标为一组
//         for (let i = 0;  i < num; i++) {
//             for (var j = 0; j < num - 4; j++) {
//                 for (var k = 0; k < 5; k++) {
//                     wins[i][j+k][count] = true 
//                 }
//                 count++
//             }
//         }

//         // 填充横向，横向每连续 5 个的坐标为一组
//         for (let i = 0;  i < num; i++) {
//             for (var j = 0; j < num - 4; j++) {
//                 for (var k = 0; k < 5; k++) {
//                     wins[j+k][i][count] = true 
//                 }
//                 count++
//             }
//         }

//         // 填充斜向
//         for (let i = 0;  i < num - 4; i++) {
//             for (var j = 0; j < num - 4; j++) {
//                 for (var k = 0; k < 5; k++) {
//                     wins[i+k][j+k][count] = true 
//                 }
//                 count++
//             }
//         }

//         // 填充反斜向
//         for (let i = num - 1;  i > 3; i--) {
//             for (var j = 0; j < num - 4; j++) {
//                 for (var k = 0; k < 5; k++) {
//                     wins[i-k][j+k][count] = true 
//                 }
//                 count++
//             }
//         }
//         // console.log(count)

//         // 初始化每个赢法的已有子数，初始全部为 0
//         manWin = [...Array(count)].fill(0)
//         computerWin = [...Array(count)].fill(0)
//     }

    

//     function calcOptimal() {
//         // console.log(board)
//         // 遍历棋盘上每个空坐标的分数
//         board.forEach((v,i) => v.forEach(j => {
//             // console.log(j)
//             if(j == 0) {
               
//                 for(let k = 0; k < count; k++) {
//                     // console.log(wins)
//                     // console.log(i,j,k)
//                     if(wins[i][j][k]) {
//                         manScore[i][j] += getSigleScore(manWin[k])
//                         computerScore[i][j] += getSigleScore(computerWin[k]) + 20

//                         // console.log(manWin[k])
//                     }
//                 }

//                 if(manScore[i][j] > max) {
//                     max = manScore[i][j]
//                     u = i
//                     v = j
//                 } 
//                 else if(manScore[i][j] == max) {
//                     if (computerScore[i][j] > computerScore[u][v]) {
//                         u = i
//                         v = j
//                     }
//                 }

//                 if (computerScore[i][j] > max) {
//                     max = computerScore[i][j]
//                     u = i
//                     v = j
//                 } else if(computerScore[i][j] == max) {
//                     if(manScore[i][j] > manScore[u][v]) {
//                         u = i;
// 						v = j;
//                     }
//                 }
//             } 
//         }))
//         // console.log(computerWin)
//         // console.log(max)
//         // console.log(u,v)

//         return {u, v}
//     }

//     function getCoord(x, y, colorNum) {

//         if (board[x][y] == 0) {
//             board[x][y] = colorNum
//         }

//         for(var k = 0; k < count; k++){
// 			if(wins[x][y][k]){
// 				manWin[k]++;
// 				computerWin[k] = 6;
// 				if(manWin[k] == 5){
// 					window.alert("you win!")
// 				}
// 			}
// 		}
//     }

//     return  {
//         initAI,
//         getCoord
//     }
// })()







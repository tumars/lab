// 封装 Gobang 类
var Gobang = (function() {

    // 定义私有变量 roundDirectArr
    var arr = [1,-1,0]
    var roundDirectArr = []
    arr.forEach(v => roundDirectArr.push([v, 1]))
    roundDirectArr.push([-1,0])

    // 定义 Gobang 的方法集
    class GobangUtil {
        getProps(x,y) {
            return 'x'+x+'y'+y
        }

        getColor(board, x, y) {
            return board[this.getProps(x,y)]
        }

        // 返回每个方向的颜色值相同的棋子数
        getDirectSameColorNum(x, y, board, direct) {
            var result = 0
            var bindGetcolor = this.getColor.bind(this, board)
            var activeColor = bindGetcolor(x,y)

            for (var i = 1; i < 5; i++) {
                var nextColor = bindGetcolor(x + i * direct[0], y + i * direct[1])
                if (activeColor == nextColor) { result++ } else {break}
            }
            return result
        }
        
        // 判断单个轴(两个方向)是否成立
        checkSingleDirect(x, y, board, direct) {
            var leftDirect = direct
            var rightDirect = direct.map(v=>-v)
            var getNum = this.getDirectSameColorNum.bind(this, x, y, board)

            return (getNum(leftDirect) + 1 + getNum(rightDirect)) >= 5  
        }

        // 判断 4 个轴中是否有一个成立
        checkRoundDirect(x, y, board, roundDirect) {
            return roundDirect.some(direct => this.checkSingleDirect(x, y, board, direct))
        }
    }

    // 定义 Gobang
    class Gobang extends GobangUtil {
        constructor(callback){
            super()
            var board = new Proxy({},{
                get: function(target, property) {
                    if (property in target) {
                        return target[property];
                    } else {
                        return 0
                    }
                }
            })

            this.board = board
            this.callback = callback
            this.playChess = this.palyChess.bind(this)
        }

        palyChess(x, y, colorNumber) {

            this.board[super.getProps(x, y, colorNumber)] = colorNumber

            var isWin = super.checkRoundDirect(x, y, this.board, roundDirectArr)
            isWin ? this.callback.end(colorNumber) : this.callback.keep(colorNumber)
        }
    }

    return Gobang
})()





var Game = (function() {
    var chessColor = 2
    var isWin = false
    var ele = document.getElementById('root')

    function instantGobang(onEnd, onKeep) {
        // 生成 Gobang 实例，定义游戏结束与继续事件
        var mygobang = new Gobang({
            end(color) {
                onEnd(color)
                isWin = true
            },
            keep(color) {
                onKeep(color)
            }
        })

        return mygobang
    }

    function renderTpl(num) {
        var tpl, 
            coordArr = [], 
            htm = '',
            arr = [...Array(num).keys()]

            rwidth = ele.clientWidth
            // console.log(rwidth)
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
                mygobang.palyChess(+coord[0], +coord[1], chessColor)
            }
        })
    }  

    return {
        start(num,{onEnd,onKeep}) {
            // 渲染棋盘
            renderHtm(renderTpl(num))

            // 生成 gobang 实例并绑定事件
            bindEvent(instantGobang(onEnd,onKeep))
        }
    }
})()







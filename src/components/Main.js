require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

let imageDatas = require('../data/imageDatas.json');

//生成../data/imageDatas文件中每一项的图片imgUrl属性,由于只执行一次所以使用自执行
imageDatas = (function genImageUrl(imageDatasArr){
    for(let i = 0; i<imageDatasArr.length; i++){
        let singleImageData = imageDatasArr[i];
        singleImageData.imgUrl = require('../images/' + singleImageData.fileName);
        imageDatasArr[i] = singleImageData;
    }
    return imageDatasArr;
})(imageDatas);

//创建每个图片组件
class ImageFigure extends React.Component{

    /*
    * 鼠标点击翻转事件
    */
    handleClick(e){

        e.stopPropagation();
        e.preventDefault();
        //先判断点击的是否是中心图片

        if (this.props.arrange.isCenter){
            this.props.inverses(); //取得主控制AppComponent中的属性,执行翻转
        }else {
            this.props.center();
        }
    }
    render(){
        let objectStyle = {};
        //如果位置属性有值则进行赋值
        if(this.props.arrange.pos){
            objectStyle = this.props.arrange.pos;
        }
        //如果旋转属性有值则进行赋值
        if(this.props.arrange.rotate) {
            (['WebkitTransform', 'MozTransform', 'msTransform', 'OTransform', 'transform']).forEach(function (value) {
                objectStyle[value] = 'rotate(' + this.props.arrange.rotate + 'deg)';
            }.bind(this))
        }
        //提供中心图片的z-index
        if(this.props.arrange.isCenter){
            objectStyle['zIndex'] = 11;
        }
        //提取类名为变量，根据isInverse添加翻转类名
        var imgFigureClsName = 'fig-img';
        imgFigureClsName += this.props.arrange.isInverse ? ' is-inverse': '';
        return (
        <figure className={imgFigureClsName}  style={objectStyle} onClick={this.handleClick.bind(this)}>
            <img src={this.props.data.imgUrl} alt={this.props.data.title}/>
            <figcaption className="fig-img-cap">
                <h2 className="fig-img-title">{this.props.data.title}</h2>
                <div className="fig-img-back" onClick={this.handleClick.bind(this)}>
                    {this.props.data.desc}
                </div>
            </figcaption>
        </figure>
    );
  }
}
//创建底部导航栏
class ControllerUnit extends React.Component{
    handleClick(e){
        e.stopPropagation();
        e.preventDefault();

        if(this.props.arrange.isCenter){
            this.props.inverses();
        }else {
            this.props.center();
        }
    }
    render(){
        let contUnitClsName = 'controller-unit';
        contUnitClsName += this.props.arrange.isCenter ? ' is-center' : '';
        contUnitClsName += this.props.arrange.isInverse ? ' is-nav-inverse' : '';
        return (
            <span className={contUnitClsName} onClick={this.handleClick.bind(this)}></span>
        );
    }
}
//获取范围值的函数
function getRangeRandom(low, high){
    return Math.floor(Math.random() * (high - low) + low);
}
//获取随机±30°旋转角度
function get30DegRandom(){
    return (Math.random() > 0.5 ? '+' : '-') + Math.floor(Math.random() * 30);
}
//主控制舞台
class AppComponent extends React.Component {
    //使用构造函数初始化state
    constructor(props){
        super(props);
        this.state = {
            imgsArrangeArr:[
                //{储存图片的状态信息包含位置、旋转角度等。在render中遍历初始化
                //    pos: {
                //      left: 0,
                //      right: 0
                //    },
                //    rotate: 30,
                //    isInver: false,   //是否翻转，默认false
                //    idCenter: false   //是否是中心图片
                //}
            ]
        }
    }

    /*
    *   切换翻转属性isInverse，采用闭包函数，目的是获得被点击的index，然后在其他地方使用，其返回值为真正的执行函数
    */
    inverseFn(index){
        return function (){
            let imgsArrangeArr = this.state.imgsArrangeArr;
            imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
            this.setState({
                imgsArrangeArr: imgsArrangeArr
            });
        }.bind(this);
    }

    /*
    *图片居中显示函数，使用闭包
    */
    centerFn(index){
        return function (){
            this.reArrange(index);
        }.bind(this);
    }


    /*重新布局图片位置,参数为需要居中的图片位置*/
    reArrange(centerIndex){

        let imgsArrangeArr = this.state.imgsArrangeArr,
            constant = AppComponent.constant,
            centerPos = constant.centerPos,
            vPosRange = constant.vPosRange,
            hPosRange = constant.hPsoRange,
            hPosRangeLeftSecX = hPosRange.leftSecX,
            hPosRangeRightSecX = hPosRange.rightSecX,
            hPosRangeY = hPosRange.Y,
            vPosRangeTopSexY = vPosRange.topSecY,
            vPosRangeX = vPosRange.X;
        /*获取中间位置图片的状态信息, 从imgsArrangeArr去除并在其中删除*/
        let imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex, 1);
        //显示居中centerIndex的图片
        imgsArrangeCenterArr[0].pos = centerPos;
        //中间图片不旋转
        imgsArrangeCenterArr[0].rotate = 0;
        imgsArrangeCenterArr[0].isCenter = true;


        /*布局顶部*/
        //获取顶部区域的状态信息
        let imgsArrangeTopArr = [];
        //顶部区域的显示图片数量0或者1个
        let topImgNum = Math.floor(Math.random() * 2);
        //标记显示在顶部的图片是从数组对象中的哪个位置拿出来的
        let topImgSpliceIndex = 0;
        //获取显示顶部位置图片在数组的index
        topImgSpliceIndex = Math.random() * (imgsArrangeArr.length - topImgNum);
        //从数组中取出，可能是1个或0个
        imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex, topImgNum);
        //使用forEach判断是否有值，如果为0则不知心
        imgsArrangeTopArr.forEach(function(value, index){
            imgsArrangeTopArr[index] = {
                pos:{
                    left: getRangeRandom(vPosRangeX[0], vPosRangeX[1]),
                    top: getRangeRandom(vPosRangeTopSexY[0], vPosRangeTopSexY[1])
                },
                rotate: get30DegRandom(),
                isInverse: false,
                isCenter: false
            }

        });

        /*布局左右侧*/
        //k取剩余数组的一半，左右各一半
        for (let i = 0, j = imgsArrangeArr.length, k = Math.floor(j / 2); i < j; i++){
            let hPosRangeLORX = 0;
            //<k表示左侧
            if(i < k){
                hPosRangeLORX = hPosRangeLeftSecX;
            }else{
                hPosRangeLORX =  hPosRangeRightSecX;
            }
            imgsArrangeArr[i]= {
                pos:{
                    left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1]),
                    top: getRangeRandom(hPosRangeY[0], hPosRangeY[1])
                },
                rotate: get30DegRandom(),
                isCenter: false
            }
        }
        //把从imgsArrangeArr中删除的顶部图片和中间位置图片重新加上
        //先判断顶部是否有去除图片
        if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
            imgsArrangeArr.splice(topImgSpliceIndex, 0, imgsArrangeTopArr[0]);
        }
        imgsArrangeArr.splice(centerIndex, 0, imgsArrangeCenterArr[0]);

        //重新设置state，重新渲染
        this.setState({
           imgsArrangeArr: imgsArrangeArr
        });
    }

    //组件加载完成后调用函数,为每张图片计算位置
    componentDidMount(){
        //获得舞台尺寸
        let stageDOM = ReactDOM.findDOMNode(this.refs.stage);
        let stageHeight = stageDOM.scrollHeight;
        let stageWidth = stageDOM.scrollWidth;
        let halfStageH = Math.ceil(stageHeight / 2);
        let halfStageW = Math.ceil(stageWidth / 2);
        //获得每个图片组件尺寸
        let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imageFigure0);
        let imgFigureHeight = imgFigureDOM.scrollHeight;
        let imgFigureWidth = imgFigureDOM.scrollWidth;
        let halfImgFigH = Math.ceil(imgFigureHeight / 2);
        let halfImgFigW = Math.ceil(imgFigureWidth / 2);

        //计算中心图片的位置点
        AppComponent.constant.centerPos.left = halfStageW - halfImgFigW;
        AppComponent.constant.centerPos.top = halfStageH - halfImgFigH;
        /*计算水平区域位置范围*/
        //计算左侧区域的水平位置范围

        AppComponent.constant.hPsoRange.leftSecX[0] = -halfImgFigW;//最小值
        AppComponent.constant.hPsoRange.leftSecX[1] = halfStageW - halfImgFigW * 3;//最大值
        //计算右侧区域的水平位置范围
        AppComponent.constant.hPsoRange.rightSecX[0] = halfStageW + halfImgFigW;//最小值
        AppComponent.constant.hPsoRange.rightSecX[1] = stageWidth - halfImgFigW;//最大值
        //计算垂直位置范围
        AppComponent.constant.hPsoRange.Y[0] = -halfImgFigH;
        AppComponent.constant.hPsoRange.Y[1] = stageHeight - halfImgFigH;

        /*计算垂直区域位置范围*/
        AppComponent.constant.vPosRange.topSecY[0] = -halfImgFigH;
        AppComponent.constant.vPosRange.topSecY[1] = halfStageH - halfImgFigH * 3;
        AppComponent.constant.vPosRange.X[0] = halfStageW - imgFigureWidth;
        AppComponent.constant.vPosRange.X[1] = halfStageW;
        /*调用重新布局函数*/
        this.reArrange(0);
    }

    render() {
        let imageFigures = [];
        let controllerUnits = [];//底部导航数组
        imageDatas.forEach(function(value, key){
            //加入key的原因是如果不加react会报错,遍历的项需要一个唯一的key。为了传递this，使用bind(this)；
            if(!this.state.imgsArrangeArr[key]){
                this.state.imgsArrangeArr[key] = {
                    pos: {
                        left: '0',
                        top: '0'
                    },
                    rotate: 0,
                    isCenter: false
                }
            }
            imageFigures.push(<ImageFigure data={value} key={key} ref={'imageFigure' + key}
            arrange={this.state.imgsArrangeArr[key]} inverses={this.inverseFn(key)} center={this.centerFn(key)}/>);

            controllerUnits.push(<ControllerUnit key={key} arrange={this.state.imgsArrangeArr[key]}
                                                 inverses={this.inverseFn(key)} center={this.centerFn(key)}/>);
        }.bind(this));
        return (
            <section className="stage" ref="stage">
                <section className="stage-imgs">
                    {imageFigures}
                </section>
                <nav className="stage-nav">
                    {controllerUnits}
                </nav>
            </section>
        );
    }
}
//es6定义属性需在class外（静态变量）
AppComponent.constant = {
    centerPos: {    //中间位置
        left: 0,
        top: 0
    },
    hPsoRange: {    //水平方向取值方位
        leftSecX: [0,0],
        rightSecX: [0,0],
        Y: [0,0]
    },
    vPosRange: {    //垂直方向取值范围
        topSecY: [0,0],
        X: [0,0]
    }
};
AppComponent.defaultProps = {
};

export default AppComponent;

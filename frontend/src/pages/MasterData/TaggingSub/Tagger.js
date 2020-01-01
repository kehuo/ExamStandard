import React, { Component, PropTypes } from 'react';
import { Input, Select, Button, DatePicker, Icon, Row, Col, Radio, Checkbox, Tag, Span, Modal} from 'antd';

let _ = require('lodash');
let moment = require('moment');
let Immutable = require('immutable');

const OpMode = {
    normal: 'NORMAL',
    batch: 'BATCH',
    split: 'SPLIT'
};

export class Tagger extends Component {
	static defaultProps = {
        op: 'edit',
        showColorSelector: true,
	};

    constructor(props, context) {
        super(props, context);
        this.state = {
            mode: OpMode.normal,
            data:[],
            revokeDisable: true,
            recoveryDisable: true,
        };
    }

    clipboard = new Clipboard('.highlightCopy');
    hltr = null;
    rowLength = 0;
    content = '';
    data = []; //控件中的数据
    opRecords = []; //操作记录
    curRecordsIndex = -1; //当前操作记录的索引
    batchFlag = false; //是否在辅助标记操作中

    componentDidMount() {
        let that = this;
        let {data,tag} = this.props;
        this.buildTable(data);
    }

    componentWillReceiveProps (nextProps, nextState) {
        //解决props的data异步更新
        let {data, tag, tagProps} = this.props;
        // let {rowLength} = this.state;
        if (nextProps.tag !== tag){
            if (this.hltr !==  null) {
                this.hltr = null;
            }
            this.rowLength = 0;
        }
        // console.log('componentWillReceiveProps', data, nextProps.data);
        // if (tag !== nextProps.tag || this.rowLength === 0) {
        //     this.buildTable(nextProps.data);
        // }
        // if (tag !== nextProps.tag || this.rowLength === 0 || data !== nextProps.data){
        if (tag !== nextProps.tag || this.rowLength === 0 || JSON.stringify(data) !== JSON.stringify(nextProps.data)
            || JSON.stringify(tagProps) != JSON.stringify(nextProps.tagProps)) {
            this.buildTable(nextProps.data);
        }
    }

    // 统计已标注的所有tag
    getTags(handleRecord = true,updateData = true){
        let {tag, onChange} = this.props;
        let bbTagger = $('.bbTagger-'+tag);
        let result = [];
        let tempRange = [];
        let allStart = [];
        let allEnd = [];
        let m1 = moment();
        bbTagger.find('td').each(function(index){
            let that = $(this);
            if (tempRange.length===0 && that.hasClass('highlightStart')){
                tempRange.push(parseInt(that.attr('index')));
                allStart.push(parseInt(that.attr('index')));
            }
            if (tempRange.length===1 && that.hasClass('highlightEnd')){
                tempRange.push(parseInt(that.attr('index')));
                allEnd.push(parseInt(that.attr('index')));
            }
            if (tempRange.length===2){
                tempRange.push(that.attr('tag'));
                result.push(tempRange);
                tempRange = [];
            }
        });
        let m2 = moment();
        console.log(`统计标记数据,耗时:${m2.diff(m1)}ms`);
        m1 = moment();
        //更新标注内容state
        let propsName = tag.split('_')[0];
        if (handleRecord){
            this.handleOpRecord(result);
        }
        m2 = moment();
        console.log(`更新操作记录,耗时:${m2.diff(m1)}ms`);
        m1 = moment();
        if (updateData){
            this.data = result; //更新数据
        }
        onChange(propsName, result, tag);
        m2 = moment();
        console.log(`更新保存数据,耗时:${m2.diff(m1)}ms`);
        return {
            items: result,
            allStart: allStart,
            allEnd: allEnd,
        };
    }

    //撤销操作
    revoke(){
        let {tag} = this.props;
        let bbTagger = $('.bbTagger-'+tag);
        if (this.opRecords.length > 0 && this.curRecordsIndex > -1){
            let opRecord = this.opRecords[this.curRecordsIndex]; //取出需要进行的操作；
            //移除记录中新增的标注
            for (let i in opRecord.add){
                for(let r = opRecord.add[i][0] ; r <= opRecord.add[i][1] ; r++){
                    let tdEl = bbTagger.find('td[index="'+ r +'"]');
                    this.hltr.removeHighlights(tdEl[0]);
                    this.removeHighLights(tdEl,this.content,false);
                }
            }
            //添加记录中移除的标注
            for (let i in opRecord.diff){
                let startEl = bbTagger.find('td[index="'+ opRecord.diff[i][0] +'"]')[0];
                let endEl = bbTagger.find('td[index="'+ opRecord.diff[i][1] +'"]')[0];
                this.hltr.setColor(this.getColorByTagName(opRecord.diff[i][2]));
                this.hltr.highlightCustomRange(startEl,endEl,false);
            }
            // this.curRecordsIndex = this.curRecordsIndex > 1 ? this.curRecordsIndex - 1 : 0;
            this.curRecordsIndex = this.curRecordsIndex - 1;
            this.handleBtnDisable();            
        }
    }

    // 恢复操作
    recovery(){
        let {tag} = this.props;
        let bbTagger = $('.bbTagger-'+tag);
        if (this.opRecords.length > 0 && this.curRecordsIndex < this.opRecords.length - 1){
            let opRecord = this.opRecords[this.curRecordsIndex + 1]; //取出需要进行的操作；
            //移除记录中移除的标注
            for (let i in opRecord.diff){
                for(let r = opRecord.diff[i][0] ; r <= opRecord.diff[i][1] ; r++){
                    let tdEl = bbTagger.find('td[index="'+ r +'"]');
                    this.hltr.removeHighlights(tdEl[0]);
                    this.removeHighLights(tdEl,this.content,false);
                }
            }
            //添加记录中新增的标注
            for (let i in opRecord.add){
                let startEl = bbTagger.find('td[index="'+ opRecord.add[i][0] +'"]')[0];
                let endEl = bbTagger.find('td[index="'+ opRecord.add[i][1] +'"]')[0];
                this.hltr.setColor(this.getColorByTagName(opRecord.add[i][2]));
                this.hltr.highlightCustomRange(startEl,endEl,false);
            }
            // this.curRecordsIndex = this.curRecordsIndex > 1 ? this.curRecordsIndex - 1 : 0;
            this.curRecordsIndex = this.curRecordsIndex + 1;
            this.handleBtnDisable();
        }
    }
    
    //记录操作变更
    handleOpRecord(result){
        // return;
        let {tag} = this.props;
        let addArray = [];
        let diffArray = [];
        let m1 = moment();
        if (tag.indexOf('parseWordsSeq') > -1 ){//分词，只比较start，end位置
            addArray = _.differenceWith(result,this.data,(o,p) => {
                return o[0] === p[0] && o[1] === p[1];
            });
            diffArray = _.differenceWith(this.data,result,(o,p) => {
                return o[0] === p[0] && o[1] === p[1];
            });
        } else{
            let m3 = moment();
            addArray = _.differenceWith(result,this.data,_.isEqual);
            let m4 = moment();
            console.log(`对比获取新增的差异,耗时:${m4.diff(m3)}ms`);
            m3 = moment();
            diffArray = _.differenceWith(this.data,result,_.isEqual);
            m4 = moment();
            console.log(`对比获取减少的差异,耗时:${m4.diff(m3)}ms`);
        }
        let m2 = moment();
        console.log(`对比获取操作差异,耗时:${m2.diff(m1)}ms`);
        m1 = moment();
        if(addArray.length > 0 || diffArray.length > 0){
            let start = this.curRecordsIndex + 1;
            let length = this.opRecords.length - start;
            if (this.opRecords.length > 0) {
                this.opRecords.splice(start,length);//移除操作记录        
            }
            this.opRecords.push({
                add:addArray,
                diff:diffArray
            }); //添加操作比对记录
            this.curRecordsIndex = this.opRecords.length > 1 ? this.opRecords.length - 1 : 0;          
        }
        m2 = moment();
        console.log(`保存获取的操作差异,耗时:${m2.diff(m1)}ms`);
        m1 = moment();        
        this.handleBtnDisable();
        m2 = moment();
        console.log(`变更撤销，恢复的button状态,耗时:${m2.diff(m1)}ms`);
    }

    //撤销，恢复按钮是否可用
    handleBtnDisable(){
        let {revokeDisable,recoveryDisable} = this.state;
        if (this.opRecords.length < 1){
            revokeDisable = true;
            recoveryDisable = true;                       
        }
        if (this.curRecordsIndex < 0) {
            revokeDisable = true;
        } else{
            revokeDisable = false;
        }
        if (this.curRecordsIndex < this.opRecords.length - 1){
            recoveryDisable = false;
        } else {
            recoveryDisable = true;
        }
        this.setState({
            revokeDisable: revokeDisable,
            recoveryDisable: recoveryDisable
        })
    }


    //整理划线样式
    drawTaggerBorder(){
        // return;
        let {tag} = this.props;
        let bbTagger = $('.bbTagger-'+tag);
        // 1、按行扫，找出头尾相连的去除前面一个的右边框
        // 2、按列扫，找出上下相连的去除下面的上边框
        let firstRowCount = null;
        bbTagger.find('tr').each(function(trIndex){
            let trEl = $(this);
            let preTd = null;
            if (firstRowCount ===null){
                firstRowCount = parseInt(trEl.attr('len'));
            }
            trEl.children('td').each(function(tdIndex){
                let tdEl = $(this);
                // 行线逻辑
                if (tdEl.hasClass('highlightStart') && !tdEl.hasClass('curHighlightTD')){
                    tdEl.css('border-left','');
                }
                if (preTd!=null && tdEl.hasClass('highlightStart')){
                    preTd.css('border-right', '0');

                }
                if (preTd!=null && preTd.hasClass('curHighlightEnd') && tdEl.hasClass('highlightStart')){
                    tdEl.css('border-left','0');
                }

                if (tdEl.hasClass('highlightEnd')){
                    preTd = tdEl;
                } else {
                    preTd = null;
                }
                // 列线逻辑
                if (tdEl.hasClass('highlightTD')){
                    let currentTdIndex = parseInt(tdEl.attr('index'));
                    let aboveTdIndex = currentTdIndex - firstRowCount;
                    if (isNaN(aboveTdIndex) || aboveTdIndex<0){
                        tdEl.css('border-top', '1px solid black')
                            .css('padding-top', '3px');
                    } else {
                        let aboveEl = bbTagger.find('td[index="'+ aboveTdIndex +'"]');
                        if (!aboveEl.hasClass('highlightTD')){
                            aboveEl.css('border-bottom', '1px solid black')
                                .css('padding-bottom', '3px');
                        }
                    }
                }
                // 当前选中区域列线逻辑
                if (tdEl.hasClass('curHighlightTD')){
                    let currentTdIndex = parseInt(tdEl.attr('index'));
                    let aboveTdIndex = currentTdIndex - firstRowCount;
                    if (isNaN(aboveTdIndex) || aboveTdIndex<0){
                        tdEl.addClass('curHighlightTopline');
                    } else {
                        let aboveEl = bbTagger.find('td[index="'+ aboveTdIndex +'"]');
                        aboveEl.addClass('curHighlightBottomline');
                    }
                }
            });
        });
    }

    //绑定Tagger小工具
    bindTaggerTooltip(hltr, content, allStart, allEnd){
        let these = this;
        let {tag} = this.props;
        let bbTagger = $('.bbTagger-'+tag);
        these.clipboard.destroy();
        bbTagger.find('td').off('click').on('click', function(e){
            $('body').find('.highlightTooltip').remove();
            let that = $(this);
            let thatIndex = parseInt(that.attr('index'));
            if (that.hasClass('highlightTD')){
                // 获得边界
                let rangeStart = -1;
                let rangeEnd = -1;
                for (let s=0;s<allStart.length;s++){
                    if (allStart[s]<=thatIndex){
                        rangeStart = allStart[s];
                    } else {
                        break;
                    }
                }
                for (let e=0;e<allEnd.length;e++){
                    if (allEnd[e]>=thatIndex){
                        rangeEnd = allEnd[e];
                        break;
                    }
                }
                // 设置选中的文本高亮框
                /// 去除已存在的当前操作区域
                bbTagger.find('.curHighlightStart').removeClass('curHighlightStart');
                bbTagger.find('.curHighlightEnd').removeClass('curHighlightEnd');
                bbTagger.find('.curHighlightTD').removeClass('curHighlightTD');
                bbTagger.find('.curHighlightTopline').removeClass('curHighlightTopline');
                bbTagger.find('.curHighlightBottomline').removeClass('curHighlightBottomline');
                /// 获取选中区域
                let bEl = [];
                for (let b=rangeStart;b<=rangeEnd;b++){
                    bEl.push('td[index="'+ b +'"]');
                }
                // 标记选中区域高亮
                bbTagger.find(bEl.join(',')).removeClass('curHighlightTD')
                                .addClass('curHighlightTD');
                /// 标记当前区域头尾
                bbTagger.find('td[index="'+ rangeStart +'"]').addClass('curHighlightStart');
                bbTagger.find('td[index="'+ rangeEnd +'"]').addClass('curHighlightEnd');
                /// 整理划线样式
                // these.drawTaggerBorder();

                // 获取选中的文本
                let copyContent = these.props.data.content.substring(rangeStart,rangeEnd+1);
                copyContent = copyContent.replace(new RegExp(/(▇)/g),' ');
                let offsetLeft = this.offsetLeft+ bbTagger[0].offsetLeft;
                let offsetTop = this.offsetTop+ bbTagger[0].offsetTop - 20;
                let html = null;
                if (tag.indexOf('parseWordsSeq') > -1){
                    html = '<div class="highlightTooltip" style="left:'+ offsetLeft +'px;top:'+ offsetTop +'px;">'
                                + '<div class="highlightCopy highlightCopy-'+ tag +'">'
                                + '<img style="vertical-align:top;margin-left: 5px;height:14px;margin-top:3px;"src="copy.png"/>'
                                + '<span style="float:right;color:#49a9ee;margin-left:5px;margin-right:5px;font-size:12px;line-height:24px;">复制</span>'
                                + '<input id="copyContent" type="hidden" value="'+ copyContent +'" /></div></div>';
                } else{
                    html = '<div class="highlightTooltip" style="left:'+ offsetLeft +'px;top:'+ offsetTop +'px;">'
                                + '<div class="highlightEraser">'
                                + '<img style="vertical-align:top;margin-left: 5px;height:15px;margin-top:3px;"src="/imgs/icon/eraser.png"/>'
                                + '<span style="float:right;color:#49a9ee;margin-left:5px;margin-right:5px;font-size:12px;line-height:24px;">擦除</span></div>'
                                + '<div class="highlightCopy highlightCopy-'+ tag +'" style="margin-left:5px">'
                                + '<img style="vertical-align:top;margin-left: 5px;height:14px;margin-top:3px;"src="/imgs/icon/copy.png"/>'
                                + '<span style="float:right;color:#49a9ee;margin-left:5px;margin-right:5px;font-size:12px;line-height:24px;">复制</span>'
                                + '<input id="copyContent" type="hidden" value="'+ copyContent +'" /></div></div>';
                }
                bbTagger.append(html);

                $(document).off('click').on('click',function(e){
                    var _con = $('.bbTagger');   // 设置目标区域
                    if(!_con.is(e.target) && _con.has(e.target).length === 0){ // Mark 1
                        bbTagger.find('.highlightTooltip').remove();    
                    }               
                })
                bbTagger.find('.highlightEraser').click(function(){
                    //删除标记
                    for (let r = rangeStart;r<=rangeEnd;r++){
                        let tdEl = bbTagger.find('td[index="'+ r +'"]');
                        these.removeHighLights(tdEl, content);
                        hltr.removeHighlights(tdEl[0]);
                    }
                    e.stopPropagation();                    
                    bbTagger.find('.highlightTooltip').remove();
                });
                //复制到剪切板
                these.clipboard = new Clipboard('.highlightCopy-'+tag,{
                    text: function(trigger) {
                        e.stopPropagation();
                        return $('#copyContent').val();
                    }
                });            
                these.clipboard.on('success', function(e) {
                    Modal.success({
                        title: '成功',
                        content: '复制成功',
                    });
                    e.clearSelection();
                    bbTagger.find('.highlightTooltip').remove();
                });
                these.clipboard.on('error', function(e) {
                    console.error('Action:', e.action);
                    console.error('Trigger:', e.trigger);
                });
            }
        });
    }

    getTagNameByColor(color){
        let {defaultColor, tagProps} = this.props;
        if (tagProps){
            for (let i=0;i<tagProps.length;i++){
                let item = tagProps[i];
                if (item && item.color == color){
                    return item.name;
                }
            };
        }
        return null;
    }

    getColorByTagName(tagName){
        let {defaultColor, tagProps} = this.props;
        if (tagProps){
            for (let i=0;i<tagProps.length;i++){
                let item = tagProps[i];
                if (item && item.name == tagName){
                    return item.color;
                }
            };
        }
        return defaultColor;
    }

    removeHighLights(tdEl, content,handleRecord = true,updateData = true){
        let {tag} = this.props;
        let bbTagger = $('.bbTagger-'+tag);
        let isCur = tdEl.hasClass('curHighlightTD');
        let isCurEnd = tdEl.hasClass('curHighlightEnd');
        tdEl.removeAttr('class')
            .removeAttr('style')
            .removeAttr('tag');
        if(tdEl.text() === '▇'){
            tdEl.css('color', '#fff');
        }
        // 处理可能左方缺线、上方多线、下方缺线问题
        let firstRowCount = parseInt(bbTagger.find('tr:first').attr('len'));
        let currentTdIndex = parseInt(tdEl.attr('index'));
        let aboveTdIndex = currentTdIndex - firstRowCount;
        let underTdIndex = currentTdIndex + firstRowCount;
        // 左方缺线
        let leftEl = tdEl.prev();
        if (leftEl && leftEl.hasClass('highlightTD')){
            leftEl.css('border-right', '');
        }
        // 上方多线
        if (!isNaN(aboveTdIndex) && aboveTdIndex>=0){
            let aboveEl = bbTagger.find('td[index="'+ aboveTdIndex +'"]');
            if (!aboveEl.hasClass('highlightTD')){
                aboveEl.css('border-bottom', '')
                        .css('padding-bottom', '');
            }
            if (isCur){
                //若为当前选择区域，去除上方的线
                aboveEl.removeClass('curHighlightBottomline')                    
            }
        }
        // 下方缺线
        if (!isNaN(underTdIndex) && underTdIndex<content.length){
            let underEl = bbTagger.find('td[index="'+ underTdIndex +'"]');
            if (underEl.hasClass('highlightTD')){
                tdEl.css('border-bottom', '1px solid black')
                    .css('padding-bottom', '3px');
            }
        }
        // 右方缺线,只有当前选择区域会导致右方缺线
        if(isCurEnd){
            let rightEl = tdEl.next();
            if (rightEl && rightEl.hasClass('highlightTD')){
                rightEl.css('border-left', '1px solid black');
            }
        }
        // 统计已标注的所有tag
        this.getTags(handleRecord,updateData);
    }

    //绑定表格标注事件
    bindTableEvents(data){
        let that = this;
        let {tag, defaultColor} = this.props;
        let bbTagger = $('.bbTagger-'+tag);
        let content = data.content;
        // 绑定linehighter事件
        if (that.hltr === null) {
            that.content = data.content;
            that.hltr = new TextHighlighter(bbTagger[0], {
                onBeforeHighlight: function (range,flag) {
                    bbTagger.find('.highlightTooltip').remove();
                    if (flag){
                        let colorSelector = bbTagger.siblings('.bbAffix_colors');
                        if (colorSelector){
                            that.hltr.setColor(colorSelector.find('.curColor').attr('color'));
                        }
                    }
                    return true;
                },
                onAfterHighlight: function (range, highlights,timestamp,handleRecord,updateData) {
                    let m1 = moment();
                    // console.log('content1',tag,content);
                    let opRecord = {};//本次操作的纪录
                    content = that.content;
                    let currentColor = that.hltr.getColor();
                    let start = -1;
                    let end = -1;
                    let startContainer = $(range.startContainer);
                    let highlightCount = highlights.length;
                    // highlight异常处理
                    // 1、startContainer为text时，实际起始点为下一个开始
                    // 2、已高亮元素为span，需要找parent
                    // 3、(焦点向后拉动后向前拉动导致)startContainer正常，endContainer多一位，通过start加上实际highlight个数做校准
                    // 4、空格会被highlight无视导致索引错乱，通过替换为“▇”解决
                    // 5、若end>start 且 start=end+1，标记需以start为准
                    if(range.startContainer.nodeName === '#text'){ // 1
                        let parentTd = startContainer.parents('td');
                        //如果start外部没有td可能起始点在文本区域之外
                        if (parentTd.length === 0){
                            start = 0;
                        } else {
                            start = parseInt(startContainer.parents('td').attr('index'))+1;
                        }
                    } else if(range.startContainer.nodeName === 'SPAN'){ // 2
                        start = parseInt(startContainer.parent().attr('index'));
                    } else {
                        start = parseInt(startContainer.attr('index'));
                    }
                    // 若startNaN 记为0（fix 异常情况）
                    if (isNaN(start) || start<0){
                        start = 0;
                    }
                    end = start+highlightCount-1; // 3

                    // console.log(start);
                    // console.log(end);
                    // 5
                    if (start === (end+1)){
                        start = end;
                    }

                    // 计算出start和end后 根据mode方式进行操作
                    let mode = that.state.mode;
                    let selectedStr = content.substring(start,end+1);
                    if (mode === OpMode.batch && handleRecord){ // 批量辅助操作
                        that.batchFlag = !that.batchFlag;                   
                        if (that.batchFlag){
                            //获取所有匹配字符的start，end
                            let indexes = [];
                            let curEnd = end;
                            let curStart = start;
                            let selectedStrLength = end - start;
                            let nextIndex = content.indexOf(selectedStr, curEnd+1);
                            indexes.push([start,end]);
                            while (nextIndex > -1){
                                curEnd = nextIndex + selectedStrLength;
                                curStart = nextIndex;
                                indexes.push([curStart,curEnd]);
                                nextIndex = content.indexOf(selectedStr, curEnd+1);
                            }
                            for(let i = 0; i < indexes.length ; i++){
                                let startEl = bbTagger.find('td[index="' + indexes[i][0] +'"]')[0];
                                let endEl = bbTagger.find('td[index="'+ indexes[i][1] +'"]')[0];
                                that.hltr.highlightCustomRange(startEl, endEl, i === indexes.length - 1, i === indexes.length - 1);
                            }
                            return;
                        }                                              
                    } else if (mode === OpMode.split && handleRecord){ // 标点分割
                        let splitArray = selectedStr.split(/[,，。;；、]/);
                        let splitStart = start;
                        if (splitArray && splitArray.length>1){
                            for (let i=0; i < splitArray.length; i++){
                                let item = splitArray[i];
                                let startEl = null;
                                let endEl = null;
                                if (item && item!==''){
                                    startEl = bbTagger.find('td[index="'+ splitStart +'"]')[0];
                                    endEl = bbTagger.find('td[index="'+ (splitStart+item.length-1) +'"]')[0];
                                    splitStart = splitStart+item.length;
                                }
                                //补足分隔符1位,并去除被标注的分隔符的选中状态
                                if (splitStart < content.length && splitStart <= end){
                                    let splitEl = bbTagger.find('td[index="'+ (splitStart++) +'"]');
                                    that.hltr.removeHighlights(splitEl[0]);
                                    that.removeHighLights(splitEl,content,false,false);
                                }
                                //标记
                                if (item && item!==''){
                                    that.hltr.highlightCustomRange(startEl, endEl, i === splitArray.length - 1,i === splitArray.length - 1);
                                }
                            }
                            return;
                        }
                    } 
                    // 4
                    let bEl = [];
                    let blankEl = [];
                    for (let b=start;b<=end;b++){
                        bEl.push('td[index="'+ b +'"]');
                        if(content[b] === '▇'){
                            blankEl.push('td[index="'+ b +'"]');
                        }
                    }
                    let m2 = moment();
                    console.log(`计算操作表格,耗时:${m2.diff(m1)}ms`);
                    m1 = moment();
                    //去除已存在的当前操作区域
                    bbTagger.find('.curHighlightStart').removeClass('curHighlightStart');
                    bbTagger.find('.curHighlightEnd').removeClass('curHighlightEnd');
                    bbTagger.find('.curHighlightTD').removeClass('curHighlightTD');
                    bbTagger.find('.curHighlightTopline').removeClass('curHighlightTopline');
                    bbTagger.find('.curHighlightBottomline').removeClass('curHighlightBottomline');

                    // 标记选中区域高亮
                    bbTagger.find(bEl.join(',')).removeAttr('class')
                                    .removeAttr('tag')
                                    .addClass('highlightTD')
                                    .attr('tag', that.getTagNameByColor(currentColor))
                                    .css('background-color', currentColor)
                                    .addClass('curHighlightTD');
                    bbTagger.find(bEl.join(',')).find('.highlighted').css('background-color',currentColor);
                    // ▇替换颜色
                    bbTagger.find(blankEl.join(',')).css('color', currentColor);
                    // 标记选中区域头尾
                    bbTagger.find('td[index="'+ start +'"]').addClass('highlightStart');
                    bbTagger.find('td[index="'+ end +'"]').addClass('highlightEnd');
                
                    // 标记当前区域头尾
                    bbTagger.find('td[index="'+ start +'"]').addClass('curHighlightStart');
                    bbTagger.find('td[index="'+ end +'"]').addClass('curHighlightEnd');

                    // 整理前后区域的头尾
                    if (start>0){
                        let beforeStart = bbTagger.find('td[index="'+ (start-1) +'"]');
                        if (beforeStart.hasClass('highlightTD')){
                            beforeStart.addClass('highlightEnd');
                        }
                    }
                    if (end<content.length-1){
                        let afterEnd = bbTagger.find('td[index="'+ (end+1) +'"]');
                        if (afterEnd.hasClass('highlightTD')){
                            afterEnd.addClass('highlightStart');
                        }
                    }
                    m2 = moment();
                    console.log(`重绘表格样式,耗时:${m2.diff(m1)}ms`);
                    m1 = moment();
                    // 整理划线样式
                    that.drawTaggerBorder();
                    m2 = moment();
                    console.log(`整理划线样式,耗时:${m2.diff(m1)}ms`);
                    m1 = moment();
                    // 统计已标注的所有tag
                    let tags = that.getTags(handleRecord,updateData);
                    let allStart = tags.allStart;
                    let allEnd = tags.allEnd;
                    m2 = moment();
                    console.log(`统计已标注的所有tag,耗时:${m2.diff(m1)}ms`);
                    m1 = moment();
                    // 绑定小工具Tooltip
                    that.bindTaggerTooltip(that.hltr, content, allStart, allEnd);
                    m2 = moment();
                    console.log(`绑定小工具Tooltip,耗时:${m2.diff(m1)}ms`);

                },
                onRemoveHighlight: function (hl) {
                    // that.removeHighLights(tdEl, content, handleRecord);
                    return true;
                }
            });
            // 设置默认Color
            that.hltr.setColor(defaultColor || '#f7f7f7');
            bbTagger.parent().find('.colorSelector').css('border', '0');
            bbTagger.parent().find('.colorSelector[color="'+defaultColor+'"]').css('border', '2px solid #00cc00').addClass('curColor'); 
            // 初始化渲染标注[只需style样式和class标记还原，因为是自己控制计算的标注，所以不用关系highlights数据的初始渲染]
            if (data.label && data.label!=={}){
                let label = JSON.parse(data.label);
                let parseWordsSeq = label.parseWordsSeq;
                let entity = label.entity;
                let currentColor = that.hltr.getColor();
                // 渲染分词
                if (tag.indexOf('parseWordsSeq') > -1 && parseWordsSeq){
                    this.data = parseWordsSeq;
                    this.drawHighlights(that.hltr, content, parseWordsSeq);
                }

                // 渲染标注
                if (tag.indexOf('entity') > -1 && entity){
                    this.data = entity; 
                    this.drawHighlights(that.hltr, content, entity);             
                }
            }
            //绑定tagProps colorSelector
            bbTagger.parent().find('.colorSelector').off('click').on('click', function(){
                bbTagger.parent().find('.colorSelector').css('border', '0').removeClass('curColor');
                $(this).css('border', '2px solid #00cc00').addClass('curColor');
                that.hltr.setColor($(this).attr('color'));
            });
        }
    }

    // 初始化画出标注起始边界、颜色
    drawHighlights(hltr, content, items){
        let that = this;
        let {tag, defaultColor, op} = this.props;
        let bbTagger = $('.bbTagger-'+tag);
        let currentColor = defaultColor;
        if (items && items.length>0){
            let start = -1;
            let end = -1;
            items.map(function(item){
                start = item[0];
                end = item[1];
                if (item.length>2 && item[2]!=null){
                    currentColor = that.getColorByTagName(item[2]);
                }
                // 空格会被highlight无视导致索引错乱，通过替换为“▇”解决,样式需特别处理
                let bEl = [];
                let blankEl = [];
                for (let b=start;b<=end;b++){
                    bEl.push('td[index="'+ b +'"]');
                    if(content[b] === '▇'){
                        blankEl.push('td[index="'+ b +'"]');
                    }
                }
                // 标记选中区域高亮
                bbTagger.find(bEl.join(','))
                                .addClass('highlightTD')
                                .attr('tag', that.getTagNameByColor(currentColor))
                                .css('background-color', currentColor);
                // ▇替换颜色
                bbTagger.find(blankEl.join(',')).css('color', currentColor);
                // 标记选中区域头尾
                bbTagger.find('td[index="'+ start +'"]').addClass('highlightStart');
                bbTagger.find('td[index="'+ end +'"]').addClass('highlightEnd');
            });

            // 整理划线样式
            that.drawTaggerBorder();

            if (op === 'edit'){
                // 统计已标注的所有tag
                let tags = that.getTags();
                let allStart = tags.allStart;
                let allEnd = tags.allEnd;

                // 绑定小工具Tooltip
                that.bindTaggerTooltip(hltr, content, allStart, allEnd);
            }
        }
    }

    drawLastBorder(hltr, content, items){

    }

    //画表格
    buildTable(data){
        let {tag,op} = this.props;
        // let {rowLength}  = this.state;
        let rowLength = this.rowLength;
        if (!data.content){
            return;
        }
        let bbTagger = $('.bbTagger-'+tag);
        // 空格会被highlight无视导致索引错乱，通过替换为“▇”解决
        let content = data.content.replace(new RegExp(/( )/g),'▇');
        let width = bbTagger.parent().width();
        if (width === 0 ){
            return ;
        }
        data.content = content;
        if (rowLength ===null || typeof rowLength === 'undefined' || rowLength === 0){
            // 动态计算每行显示个数
            rowLength = parseInt((width - 10)/22);
            if (rowLength < 0){
                rowLength = 0;
            }
            // this.setState({rowLength: rowLength});
            this.rowLength = rowLength;
        }
        var tableHtml = '<table cellpadding="0" cellspacing="0"><tbody>';
        for (let i=0;i<content.length/rowLength;i++){
            let trHtml = '';
            let trLength = 0;
            let blankStyle = '';
            for (let j=i*rowLength;j<(i+1)*rowLength;j++){
                if(j === content.length){
                    break;
                }
                let word = content[j];
                blankStyle = '';
                if(word === '▇'){
                    blankStyle = 'color:#fff;';
                }
                trHtml += '<td index="'+ j +'" style="'+ blankStyle +'">'+ content[j] +'</td>';
                trLength++;
            }
            trHtml = '<tr index="'+ i +'" len="'+ trLength +'">' + trHtml +'</tr>';
            tableHtml+=trHtml;
        }
        tableHtml += '</tbody></table>';
        bbTagger.html(tableHtml);
        if (op === 'edit'){
            this.bindTableEvents(data);
        } else{
            this.bindTableWithNoEvents(data);
        }
    }

    changeMode(newMode){
        let mode = this.state.mode;
        if (mode === newMode){
            mode = OpMode.normal;
        } else {
            mode = newMode;
        }
        this.setState({mode: mode});
    }

	render() {
        let {tag, tagProps, tagStyle, tools , op, showColorSelector} = this.props;
        let btnFocusStyle = {color:'#49a9ee', borderColor:'#49a9ee', background:'#fff'};
        let btnBlurStyle = {color:'rgba(0, 0, 0, 0.65)', borderColor:'#d9d9d9', background:'#fff'};
        let btnDisableStyle = {color: '#999' ,borderColor: '#d9d9d9',background:'#fff',cursor:'not-allowed'};
        let iconSplitFocusSrc = '/imgs/icon/split_active.png';
        let iconSplitBlurSrc = '/imgs/icon/split.png';
        let iconBatchFocusSrc = '/imgs/icon/batch_active.png';
        let iconBatchBlurSrc = '/imgs/icon/batch.png';
        let iconRevokeSrc = '/imgs/icon/revoke.png';
        let iconRecoverySrc = '/imgs/icon/recovery.png';
        // let iconRevokeActiveSrc = '/imgs/icon/revoke_active.png';
        // let iconRecoveryActiveSrc = '/imgs/icon/split.png';
        let iconRevokeDisableSrc = '/imgs/icon/revoke_disable.png';
        let iconRecoveryDisableSrc = '/imgs/icon/recovery_disable.png';
        let colorSelector = null;
        if (tagProps){
            let tagPerLine = 7;
            let tagPerCol = 3;
            let firstOffset = 1;
            if (tagStyle && tagStyle.tagPerLine) {
                tagPerLine = tagStyle.tagPerLine;
                tagPerCol = Math.floor(22.0/tagPerLine);
                firstOffset = Math.floor((24 - tagPerLine * tagPerCol)/2.0);
            }

            let count = 0;
            colorSelector=(<div className= {op !== 'list' ? 'bbAffix bbAffix_colors': ''} ><div style={{backgroundColor:'#efefef', marginTop:-5, marginBottom:15,display:op === 'list' ? 'none' : ''}}>
                <Row gutter={16} style={{padding:'10px 25px 20px 16px'}}>
                    {tagProps.map(o=>
                        {
                            let col = '';
                            if (count % tagPerLine === 0){
                                col = (<Col span={tagPerCol} offset={firstOffset} style={{paddingTop:10}}>
                                            <div className="colorSelector" name={o.name} color={o.color} style={{backgroundColor:o.color, height:30, lineHeight:'30px', textAlign:'center', cursor:'pointer'}}>
                                                {o.description}
                                            </div>
                                        </Col>)
                            } else {
                                col = (<Col span={tagPerCol} style={{paddingTop:10}}>
                                            <div className="colorSelector" name={o.name} color={o.color} style={{backgroundColor:o.color, height:30, lineHeight:'30px', textAlign:'center', cursor:'pointer'}}>
                                                {o.description}
                                            </div>
                                        </Col>)
                            }
                            count++;
                            return col;
                        }
                    )}
                </Row>
            </div></div>);
            if (this.props.tagShowType === 'small') {
                colorSelector=(<div className='' ><div style={{backgroundColor:'#efefef', marginTop:-5, marginBottom:15}}>
                    <Row gutter={16} style={{padding:'10px 25px 20px 16px'}}>
                        {tagProps.map(o=>
                            {
                                let col = (<Col span={4} style={{paddingTop:10}}>
                                                <div className="colorSelector" name={o.name} color={o.color} style={{backgroundColor:o.color, height:30, lineHeight:'30px', textAlign:'center', cursor:'pointer'}}>
                                                    {o.description}
                                                </div>
                                            </Col>)
                                return col;
                            }
                        )}
                    </Row>
                </div></div>);
            }
        }
        let topTools = null;
        if (tools && op === 'edit'){
            topTools = (
                <div style={{marginBottom:10}}>
                    {tools.indexOf('BATCH')>-1 &&
                    <span>
                        <button type="button" className="ant-btn" style={this.state.mode===OpMode.batch?btnFocusStyle:btnBlurStyle} onClick={this.changeMode.bind(this, OpMode.batch)}>
                            <img src={this.state.mode===OpMode.batch?iconBatchFocusSrc:iconBatchBlurSrc} style={{verticalAlign:'top',marginTop:'2px'}}/>
                            <span style={{marginLeft:'5px',fontSize:14}}>辅助标注</span>
                        </button>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                    }
                    {tools.indexOf('SPLIT')>-1 &&
                    <span>
                        <button type="button" className="ant-btn" style={this.state.mode===OpMode.split?btnFocusStyle:btnBlurStyle} onClick={this.changeMode.bind(this, OpMode.split)}>
                            <img src={this.state.mode===OpMode.split?iconSplitFocusSrc:iconSplitBlurSrc} style={{verticalAlign:'top',marginTop:'2px'}}/>
                            <span style={{marginLeft:'5px',fontSize:14}}>标点分割</span>
                        </button>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </span> 
                    }
                    {tools.indexOf('REVOKE')>-1 &&
                    <span>
                        <button type="button" className="ant-btn" style={this.state.revokeDisable ? btnDisableStyle : btnBlurStyle} onClick={this.revoke.bind(this)}>
                            <img src={this.state.revokeDisable ? iconRevokeDisableSrc : iconRevokeSrc} style={{verticalAlign:'top',marginTop:'2px'}}/> 
                            <span style={{marginLeft:'5px',fontSize:14}}>撤销操作</span>
                        </button>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;                    
                    </span>
                    }
                    {tools.indexOf('RECOVERY')>-1 &&
                    <span>
                    <button type="button" className="ant-btn" style={this.state.recoveryDisable ? btnDisableStyle : btnBlurStyle} onClick={this.recovery.bind(this)}>
                            <img src={this.state.recoveryDisable ? iconRecoveryDisableSrc : iconRecoverySrc} style={{verticalAlign:'top',marginTop:'2px'}}/> 
                            <span style={{marginLeft:'5px',fontSize:14}}>恢复操作</span>
                        </button>
                    </span>
                    }
                </div>
            );
        }
        // let containerStyle = null;
        // if (op === 'list'){
        //     containerStyle = {width:'100%'};
        // } else{
        //     containerStyle = {width:'60%',marginLeft:'20%',marginRight:'20%' };
        // }
        let containerStyle = null;
        if (op !== 'list' && tag.indexOf('entity') > -1){
            containerStyle = {padding:10,border:'1px solid #ddd'};
        } else {
            containerStyle = {border:'0'};
        }
		return (
            <div>
                {showColorSelector && colorSelector}
                {topTools}
                <div  style={containerStyle} className={'bbTagger bbTagger-'+tag}></div>
            </div>
		);
	}

    drawEdgeHighlight(rangeFocus) {
        let {tag, defaultColor} = this.props;
        let bbTagger = $('.bbTagger-'+tag);
        // clear edge-highlight edges
        bbTagger.find('.edgeLeft').removeClass('edgeLeft');
        bbTagger.find('.edgeMid').removeClass('edgeMid');
        bbTagger.find('.edgeRight').removeClass('edgeRight');
        bbTagger.find('.edgeAll').removeClass('edgeAll');

        // edge-highlight this tag
        if (rangeFocus) {
            let a = rangeFocus[0];
            let b = rangeFocus[1];
            for (let i=a; i<=b; i++) {
                let indexN = 'td[index="' + i + '"]';
                if (a == b) {
                    bbTagger.find(indexN).addClass('edgeAll');
                } else if (i == a) {
                    bbTagger.find(indexN).addClass('edgeLeft');
                } else if (i == b) {
                    bbTagger.find(indexN).addClass('edgeRight');
                } else {
                    bbTagger.find(indexN).addClass('edgeMid');
                }
            }
        }
    }

    bindTableWithNoEvents(data){
        let that = this;
        let content = data.content;
        // 初始化渲染标注[只需style样式和class标记还原，因为是自己控制计算的标注，所以不用关系highlights数据的初始渲染]
        if (data.label && data.label!=={}){
            let label = JSON.parse(data.label);
            let parseWordsSeq = label.parseWordsSeq;
            let entity = label.entity;
            let {tag, defaultColor} = this.props;
            let bbTagger = $('.bbTagger-'+tag);
            // 绑定linehighter事件
            // var hltr = new TextHighlighter(bbTagger[0], {});
            var hltr = null;
            // 渲染分词
            if (tag.indexOf('parseWordsSeq') > -1 && parseWordsSeq){
                this.drawHighlights(hltr, content, parseWordsSeq);
            }
            // 渲染标注
            if (tag.indexOf('entity') > -1 && entity){
                this.drawHighlights(hltr, content, entity);
            }
            // binding handler for position select function
            bbTagger.find('td').off('click').on('click', function () {
                let x = $(this).attr('index');
                let intX = parseInt(x);
                if (that.props.onSelectView) {
                    that.props.onSelectView(intX);
                }
                let rangeFocus = searchRange(entity, intX);
                that.drawEdgeHighlight(rangeFocus);
            });
        }
    }
}

function searchRange(entity, intX) {
    let rst = null;
    for (let i=0; i<entity.length; i++) {
        // [[0, 1, "symptom", "发热"], [2, 3, "time", "三天"]
        let curE = entity[i];
        if (curE[0]<=intX && curE[1]>=intX) {
            rst = [curE[0], curE[1]]
            break;
        }
    }
    return rst;
}
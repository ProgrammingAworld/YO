/**
 * @component Calendar
 * @version 3.0.0
 * @description 日历组件，基于groupList组件实现。
 *
 * 可通过以下两种方式定义日期范围:
 *  - 传入具体的起、始日期。
 *  - 传入距离系统当日的间隔天数，默认90。
 * 入住时间在今天之前，会被重置为今天。
 * 入住时间在离店时间之后，则互换。
 * 默认selectionStart、selectionEnd可选择同一天。
 *
 * #### 何时使用
 *
 * - 当用户需要选择日期范围时，可以在弹出日期界面进行选择。
 * - 起、始选中日期默认显示的文字是入店、离店，可通过CSS伪类修改。
 *
 * @instructions {instruInfo: ./calendar.md}{instruUrl: calendar.html?hideIcon}
 * @author qingguo.xu
 */

import CalendarCore from './CalendarCore.js';
import CalendarItem from './CalendarItem.js';
import GroupList from '../../grouplist/src/';
import React, { PropTypes, Component } from 'react';
import { replaceRedundantSpaces } from '../../common/util.js';
import './style.scss';

const defaultProps = {
    duration: 90,
    extraClass: '',
    selectionStart: '',
    selectionEnd: '',
    selectionStartText: '入店',
    selectionEndText: '离店',
    allowSingle: false,
    onChange() {
    }
};

const propTypes = {
    /**
     * @property duration
     * @description 允许用户选择的日期范围
     * @type Number/Array
     * @default 90
     */
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
    /**
     * @property extraClass
     * @description 组件的额外样式
     * @type String
     */
    extraClass: PropTypes.string,
    /**
     * @property selectionStart
     * @description 默认选中范围的开始日期
     * @type String
     */
    selectionStart: PropTypes.string,
    /**
     * @property selectionEnd
     * @description 默认选中范围的结束日期
     * @type String
     */
    selectionEnd: PropTypes.string,
    /**
     * @property selectionStartText
     * @description 选中范围的开始日期标注，可传入文字或yo支持的icofont
     * @type String
     * @default '入店'
     */
    selectionStartText: PropTypes.string,
    /**
     * @property selectionEndText
     * @description 选中范围的结束日期标注，可传入文字或yo支持的icofont
     * @type String
     */
    selectionEndText: PropTypes.string,
    /**
     * @property allowSingle
     * @description 是否只允许选中单个日期
     * @type Bool
     * @default false
     */
    allowSingle: PropTypes.bool,
    /**
     * @property onChange
     * @type Function
     * @param {Object} obj 选中范围的开始日期、结束日期对象
     * @param {String} obj.selectionStart 选中范围的开始日期
     * @param {String} obj.selectionEnd 选中范围的结束日期
     * @description 点击选中日期时回调函数
     */
    onChange: PropTypes.func
};

export default class Calendar extends Component {
    constructor(props) {
        super(props);
        const { duration, selectionStart, selectionEnd, allowSingle } = props;
        this.calendarModel = new CalendarCore();
        this.state = {
            data: this.calendarModel.getData(duration, selectionStart, selectionEnd, allowSingle)
        };
    }

    componentWillMount() {
        // 注册点击check事件， 在CalendarCore理触发
        this.calendarModel.registerEventHandler('check', obj => this.props.onChange(obj));
    }

    componentWillReceiveProps(nextProps) {
        const { duration, selectionStart, selectionEnd, allowSingle } = nextProps;
        this.setState({
            data: this.calendarModel.getData(duration, selectionStart, selectionEnd, allowSingle)
        });
    }

    render() {
        const { selectionStartText, selectionEndText, extraClass } = this.props;
        return (
            <section className={replaceRedundantSpaces(`yo-calendar ${extraClass}`)}>
                <ul className="week-bar">
                    <li className="weekend">日</li>
                    <li>一</li>
                    <li>二</li>
                    <li>三</li>
                    <li>四</li>
                    <li>五</li>
                    <li className="weekend">六</li>
                </ul>
                <GroupList
                    itemTouchClass={null}
                    renderGroupItem={item => <CalendarItem
                        selectionStartText={selectionStartText}
                        selectionEndText={selectionEndText}
                        week={item.week}
                        isRender={item.isRender}
                        onChange={str => this.calendarModel.handleChange(str)}
                    />}
                    dataSource={this.state.data}
                />
            </section>
        );
    }
}

Calendar.propTypes = propTypes;
Calendar.defaultProps = defaultProps;

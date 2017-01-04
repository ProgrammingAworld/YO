/**
 * @component Suggest
 * @version 3.0.0
 * @description 输入提示组件, 根据用户的输入给出待选项并展示在输入框下方。
 * Suggest的内容分为两个区域, 推荐区域(recommendTmpl)会在用户输入开始前渲染, 可以用来给出一些热门推荐。
 * 结果区域(resultTmpl)用来响应用户的输入, 根据用户的输入给出输入提示。
 *
 * @author jiao.shen
 * @instructions {instruInfo: ./suggest/suggest.md}{instruUrl: suggest/city_select_example.html?hideIcon}
 * @instructions {instruInfo: ./suggest/useWithPopup.md}{instruUrl: suggest/use_with_popup.html?hideIcon}
 */
import React, { Component, PropTypes } from 'react';
import './style.scss';
import '../../common/tapEventPluginInit';
import List from '../../list/src';
import throttle from 'lodash/throttle';
import { replaceRedundantSpaces } from '../../common/util';

const propTypes = {
    /**
     * @property results
     * @type Array
     * @default null
     * @description 渲染在结果区的数据源,数组类型,数组元素的类型可以是字符串/数字,它们会直接作为列表项的内容;
     *
     * 也可以是对象,这个对象必须有text属性。
     */
    results: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.shape({
            text: PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string
            ])
        })
    ])),
    /**
     * @property onConditionChange
     * @type Function
     * @param {String} value 输入框当前的value
     * @default null
     * @description 输入框onChange事件回调,必需。
     *
     * 为了使组件正常工作,你必须定义这个属性,根据每次的value来更新results。
     */
    onConditionChange: PropTypes.func,
    /**
     * @property extraClass
     * @type String
     * @default null
     * @description 附加给组件根节点的额外类名
     */
    extraClass: PropTypes.string,
    /**
     * @property itemTouchClass
     * @type String
     * @default item-light
     * @description 点击结果区域列表项时添加的className
     */
    itemTouchClass: PropTypes.string,
    /**
     * @property noDataTmpl
     * @type Element
     * @default null
     * @description 没有suggest结果时的模板
     * noDataTpl
     */
    noDataTmpl: PropTypes.element,
    /**
     * @property recommendTmpl
     * @type Element
     * @default null
     * @description 推荐区域内容,在搜索条件为空时展示
     */
    recommendTmpl: PropTypes.element,
    /**
     * @property onItemTap
     * @type Function
     * @default () =>{}
     * @param {Object} item 数据源中的元素
     * @param {Number} index item在数据源中的index
     * @description 点击结果项时的回调
     */
    onItemTap: PropTypes.func,
    /**
     * @property renderItem
     * @type Function
     * @default Suggest.renderItem
     * @param {Object} item 结果项的数据对象,格式为{value,text}
     * @description 自定义结果项的渲染方式,返回JSX或字符串。
     */
    renderItem: PropTypes.func,
    /**
     * @property renderResult
     * @type Function
     * @default null
     * @param results 结果列表
     * @description 自定义结果容器的渲染方式,返回JSX。
     *
     * 组件默认以List的形式渲染结果区域,如果不希望以List的形式展示结果,可以传入这个函数。组件会使用这个函数返回的JSX渲染结果区域。
     */
    renderResult: PropTypes.func,
    /**
     * @property showCancelButton
     * @type Bool
     * @default false
     * @description 是否显示取消按钮,默认不显示
     */
    showCancelButton: PropTypes.bool,
    /**
     * @property cancelButtonText
     * @type String
     * @default 取消
     * @description 取消按钮文本
     */
    cancelButtonText: PropTypes.string,
    /**
     * @property onCancelButtonClick
     * @type Function
     * @default () =>{}
     * @description 点击取消按钮时的回调
     */
    onCancelButtonTap: PropTypes.func,
    /**
     * @property onFocus
     * @type Function
     * @default () =>{}
     * @param condition 当前输入框的value
     * @description 输入框聚焦时的回调
     */
    onFocus: PropTypes.func,
    /**
     * @property onBlur
     * @type Function
     * @default () =>{}
     * @param condition 当前输入框的value
     * @description 输入框失去焦点时的回调
     */
    onBlur: PropTypes.func,
    /**
     * @property defaultCondition
     * @type String
     * @default null
     * @description 展示在输入框中的默认值
     */
    defaultCondition: PropTypes.string,
    /**
     * @property placeholder
     * @type String
     * @default null
     * @description 输入框的placeholder
     */
    placeholder: PropTypes.string,
    /**
     * @property inputIcon
     * @type String
     * @default 'delete'
     * @description 展示在输入框右侧的icon,有四个icon可供选择:delete,loading,refresh和stop。
     *
     * delete图标点击以后会清除输入框的内容,其余的三个图标可以通过传入onIconTap属性来定制点击它们的回调。
     */
    inputIcon: PropTypes.oneOf(['delete', 'loading', 'refresh', 'stop']),
    /**
     * @property onIconTap
     * @type Function
     * @default () =>{}
     * @param iconName 图标名称
     * @param condition 当前输入框的value
     * @description 点击input icon触发的回调
     */
    onIconTap: PropTypes.func,
    /**
     * @property throttleGap
     * @type Number
     * @default 300
     * @description 设置此属性以后,文本框的onChange事件的触发频率会降低,例如设置为300会使得onChange每300毫秒触发一次.
     *
     * 通过这种方式,可以控制组件结果区域的render次数,降低和服务器交互的频率。
     */
    throttleGap: PropTypes.number,
    /**
     * @property showMask
     * @type Bool
     * @description 在弹起键盘时，是否显示遮罩层。
     */
    showMask: PropTypes.bool
};

export default class Suggest extends Component {

    static getResultText(result) {
        let ret = null;
        if (typeof result === 'object') {
            ret = result.text;
        } else if (typeof result === 'string' || typeof result === 'number') {
            ret = result;
        }
        return ret;
    }

    static renderItem(result) {
        return Suggest.getResultText(result);
    }

    constructor(props) {
        super(props);
        this.prev = null;
        this.state = { condition: props.defaultCondition, showRecommendMask: false };
        this.wrapConditionChangeHandler();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.defaultCondition !== this.props.defaultCondition) {
            this.setState({ condition: nextProps.defaultCondition });
        }
    }

    onConditionChange(value) {
        this.onConditionChangeHandler(value);
        this.setState({ condition: value });
    }

    getIconClass(iconName, animation) {
        const { showCancelButton, inputIcon } = this.props;
        const iconClass = [
            'yo-ico',
            `yo-ico-${iconName}`,
            showCancelButton ? 'show-cancel' : ''
        ].join(' ').replace(/\s$/, '');

        let show = null;
        if (!inputIcon) {
            show = '';
        } else if (inputIcon === iconName) {
            show = 'show';
            if (iconName === 'delete' && this.state.condition === '') {
                show = '';
            }
        } else {
            show = '';
        }

        return [
            iconClass,
            show,
            animation
        ].join(' ').replace(/\s$/, '');
    }

    /**
     * @method clearInput
     * @description 清空输入框的内容
     */
    clearInput() {
        this.onConditionChange('');
    }

    wrapConditionChangeHandler(gap = this.props.throttleGap) {
        if (gap) {
            this.onConditionChangeHandler = throttle((value) => {
                if (value !== this.prev) {
                    this.prev = value;
                    this.props.onConditionChange(value);
                }
            }, gap);
        } else {
            this.onConditionChangeHandler = (value) => {
                if (value !== this.state.condition) {
                    this.props.onConditionChange(value);
                }
            };
        }
    }

    renderResult(results) {
        const {
            renderItem,
            onItemTap,
            noDataTmpl,
            itemTouchClass
        } = this.props;

        let ret = null;
        if (this.state.condition) {
            if (results.length) {
                ret = (
                    <List
                        ref={(component) => {
                            this.resultList = component;
                        }}
                        dataSource={results}
                        renderItem={renderItem}
                        infinite={false}
                        onItemTap={onItemTap}
                        itemTouchClass={itemTouchClass}
                    />
                );
            } else {
                ret = noDataTmpl;
            }
        }
        return ret;
    }

    render() {
        const { condition } = this.state;
        const {
            results,
            extraClass,
            renderResult,
            showCancelButton,
            onIconTap,
            onCancelButtonTap,
            placeholder
        } = this.props;
        const rootClass = [
            'yo-suggest',
            extraClass,
            showCancelButton ? 'yo-suggest-modal' : ''
        ].join(' ').trim();
        const realRenderResult = renderResult || this.renderResult.bind(this);
        const deleteIconClass = this.getIconClass('delete');
        const loadingIconClass = this.getIconClass('loading');
        const refreshIconClass = this.getIconClass('refresh');
        const stopIconClass = this.getIconClass('stop');
        const resultContent = realRenderResult(results);

        return (
            <div className={rootClass}>
                <div className="operate">
                    <form className="action">
                        <i className="yo-ico yo-ico-suggest">&#xf067;</i>
                        <input
                            autoComplete="off"
                            ref={(dom) => {
                                this.input = dom;
                            }}
                            value={condition}
                            onChange={(evt) => {
                                this.onConditionChange(evt.target.value);
                            }}
                            onFocus={(evt) => {
                                this.props.onFocus(evt.target.value);
                                this.setState({ showRecommendMask: true });
                            }}
                            onBlur={(evt) => {
                                this.props.onBlur(evt.target.value);
                                // 留出键盘收起的时间
                                this.setState({ showRecommendMask: false });
                            }}
                            type="search"
                            className={'input'}
                            id="yo-suggest-input"
                            placeholder={placeholder}
                        />
                        <i
                            className={deleteIconClass}
                            onTouchTap={() => {
                                this.clearInput();
                                this.input.focus();
                            }}
                        >
                            &#xf077;
                        </i>
                        <i className={loadingIconClass}>&#xf089;</i>
                        <i
                            onTouchTap={() => onIconTap('refresh', condition)}
                            className={refreshIconClass}
                        >
                            &#xf07a;
                        </i>
                        <i
                            onTouchTap={() => onIconTap('stop', condition)}
                            className={stopIconClass}
                        >
                            &#xf063;
                        </i>
                    </form>
                    <span
                        className="cancel"
                        onTouchTap={(evt) => {
                            onCancelButtonTap(evt);
                        }}
                    >
                        {this.props.cancelButtonText}
                    </span>
                </div>
                <div className="cont" onTouchTap={() => this.input.blur()}>
                    <div
                        className={replaceRedundantSpaces(`mask ${this.props.showMask && this.state.showRecommendMask ? 'show' : ''}`)}
                    />
                    <div className="recommend">
                        {this.props.recommendTmpl}
                    </div>
                    <div className={replaceRedundantSpaces(`result ${resultContent ? 'show' : ''}`)}>
                        {resultContent}
                    </div>
                </div>
            </div>
        );
    }
}

Suggest.defaultProps = {
    results: [],
    onConditionChange: () => {
    },
    extraClass: '',
    itemTouchClass: 'item-touch',
    noDataTmpl: null,
    onItemTap: () => {
    },
    renderItem: Suggest.renderItem,
    renderResult: null,
    showCancelButton: false,
    showLoadingIcon: false,
    onFocus: () => {
    },
    onBlur() {
    },
    onIconTap: () => {
    },
    defaultCondition: '',
    placeholder: '搜索',
    inputIcon: 'delete',
    onCancelButtonTap() {
    },
    recommendTmpl: null,
    throttleGap: null,
    cancelButtonText: '取消',
    showMask: false
};

Suggest.propTypes = propTypes;

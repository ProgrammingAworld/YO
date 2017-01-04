#### 基本使用

吸顶效果在APP中非常常见，然而实现它并不是一件非常容易的事，如果使用zepto实现，可能需要做很多繁琐的计算和dom操作。
为了能更便捷地实现吸顶效果，我们提供了`Sticky`组件，它的使用非常简单，
你需要做的仅仅是用<Scroller.Sticky>标签包裹需要吸顶的dom。注意，和`Touchable`类似的是
它只能接受一个唯一子元素，请参考下面的代码：

```
<Scroller>
    ...
    <Scroller.Sticky>
        <div>
            <span>我已经有吸顶效果啦</span>
            <Touchable touchClass='touch-class' onTap={()=>{console.log('tap.')}}>
                <span className='float-right'>点我</span>
            </Touchable>
        </div>
    </Scroller.Sticky>
    ...
</Scroller>
```

** 需要注意的是，这个组件只能在`Scroller`组件内部使用，如果需要给`List`中的元素添加吸顶效果，建议
直接使用`Grouplist`组件。 **

** 这个组件可以在`Scroller`内部的任何位置使用，无需考虑dom结构。 **

#### 给sticky容器添加额外样式类

吸顶效果的实现借助了一个始终定位在`Scroller`容器顶部的一个dom容器来实现，
在`Scroller`滚动到某个dom的吸顶范围之内时，会将这个dom复制到sticky容器中。

在某些情况下你可能希望处于sticky状态的元素拥有一些特殊的样式，这可以通过
定义`stickyExtraClass`实现：

```
<Scroller.Sticky stickyExtraClass='sticky-extra'>
    ...
</Scroller.Sticky>
```

#### 实例

以下的代码就是右侧Demo的源码，这里的代码随机生成了十个分组，每个分组都有一个吸顶的标题，每个标题内部包含了一个span元素和一个`Touchable`：

```
class ScrollerDemo extends Component {

    getContent() {
        return getRandomColors(5).map((item, index) => {
            return <div className="item" style={{ backgroundColor: item }}
                        key={index}>{index}</div>;
        });
    }

    getGroup(i) {
        const randomHeight = Math.random() * 20 + 20;
        return (
            <div key={i} className="demo-group">
                <Scroller.Sticky>
                    <div style={{ height: randomHeight, lineHeight: randomHeight + 'px' }} className="sticky-title">
                        <span>{'Sticky Header ' + i}</span>
                        <Touchable touchClass='touchable-opacity' onTap={() => {
                            Toast.show('sticky header ' + i);
                        }}>
                            <span className="touchable-right" style={{ float: 'right' }}>tap!</span>
                        </Touchable>
                    </div>
                </Scroller.Sticky>
                {this.getContent()}
            </div>
        );
    }

    render() {
        return (
            <Page title="Scroller: Sticky" onLeftPress={() => location.href = './index.html'}>
                <Scroller
                    ref="scroller"
                    extraClass={'scroller_wrapper'}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, i) => {
                        return this.getGroup(i);
                    })}
                </Scroller>
            </Page>
        );
    }
}

function getRandomColors(num) {
    var _color = [];
    for (var j = 0; j < num; j++) {
        var letters = '3456789ABC'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 10)];
        }
        _color.push(color);
    }

    return _color;
}
```


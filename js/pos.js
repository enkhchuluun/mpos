'use strict';

var Pos = React.createClass({
    displayName: 'Pos',

    getInitialState: function getInitialState() {
        return {
            pendingOrderCount: 0,
            itemList: [],
            searchReset: false
        };
    },

    hasItem: function hasItem(productNo, variantNo) {
        var result = false;
        this.state.itemList.forEach(function (item) {
            if (item.productNo == productNo && item.variantNo == variantNo) {
                result = true;
                return true;
            }
        });

        return result;
    },

    itemAddHandler: function itemAddHandler(variant) {
        var newVariantList = [];
        var oldVariantList = [];

        if (!this.hasItem(variant.productNo, variant.variantNo)) {

            newVariantList.push(variant);
        } else {
            console.log('old item');

            oldVariantList.push(variant);
        }

        console.log('newVariantList:%O, oldVariantList:%O', newVariantList, oldVariantList);

        var itemList = this.state.itemList;

        //old items
        oldVariantList.forEach(function (oldVariant, i) {
            var index = this.state.itemList.findIndex(function (item) {
                return item.productNo == oldVariant.productNo && item.variantNo == oldVariant.variantNo;
            });

            var quantity = this.state.itemList[index].selectedQuantity + oldVariant.selectedQuantity;

            var updatedVariant = React.addons.update(itemList[index], { selectedQuantity: { $set: quantity } });

            var command = { $splice: [[index, 1, updatedVariant]] };
            itemList = React.addons.update(itemList, command);
        }.bind(this));

        //new items
        itemList = itemList.concat(newVariantList);

        this.setState({
            itemList: itemList
        });
    },

    handleCounterKeyAction: function handleCounterKeyAction(index, reset, number, minusPlus, removeItem, backspace) {
        console.log('index: %O, reset:%O, number:%O, minusPlus:%O, removeItem:%O, backspace:%O', index, reset, number, minusPlus, removeItem, backspace);

        if (this.state.itemList.length > 0 && index > -1 && index < this.state.itemList.length) {
            var itemList = this.state.itemList;

            if (removeItem) {
                var command = { $splice: [[index, 1]] };

                this.setState({
                    itemList: React.addons.update(itemList, command)
                });
            } else {
                var targetQuantity = itemList[index].selectedQuantity;

                if (number > -1 && reset) {
                    targetQuantity = number;
                } else if (number > -1 && !reset) {
                    if (targetQuantity > 0) {
                        var temp = targetQuantity + '' + number;
                        temp = parseInt(temp);

                        if (temp <= 10000) {
                            targetQuantity = temp;
                        }
                    } else if (targetQuantity == 0) {
                        targetQuantity = number;
                    }
                }

                if (backspace) {
                    if (targetQuantity <= 9) {
                        targetQuantity = 0;
                    } else {
                        targetQuantity = targetQuantity + '';
                        targetQuantity = targetQuantity.substring(0, targetQuantity.length - 1);
                        targetQuantity = parseInt(targetQuantity);
                    }
                }

                if (minusPlus > 0) {
                    targetQuantity = targetQuantity + 1;

                    if (targetQuantity > 10000) {
                        targetQuantity = 10000;
                    }
                }
                if (minusPlus < 0) {
                    targetQuantity = targetQuantity - 1;

                    if (targetQuantity < 1) {
                        targetQuantity = 1;
                    }
                }

                var updatedVariant = React.addons.update(itemList[index], { selectedQuantity: { $set: targetQuantity } });

                var command = { $splice: [[index, 1, updatedVariant]] };

                this.setState({
                    itemList: React.addons.update(itemList, command)
                });
            }
        }
    },

    resetPos: function resetPos() {
        console.log('reset true');
        this.setState({
            itemList: [],
            searchReset: true
        });

        /*console.log('reset false');
        this.setState({
            searchReset: false
        });*/
    },

    resetCallback: function resetCallback() {
        this.setState({
            searchReset: false
        });
    },

    render: function render() {
        var radarStyle = this.state.pendingOrderCount > 0 ? { display: 'block' } : { display: 'none' };
        return React.createElement(
            'div',
            null,
            React.createElement(PosCounter, { itemList: this.state.itemList, printCallback: this.resetPos, branchName: this.props.branchName, counterKeyActionCallback: this.handleCounterKeyAction }),
            React.createElement(
                'div',
                { className: 'mm-pos-container' },
                React.createElement(
                    'div',
                    { className: 'header' },
                    React.createElement(
                        'div',
                        { className: 'radar' },
                        React.createElement(
                            'div',
                            { className: 'radar-count', style: radarStyle },
                            this.state.pendingOrderCount
                        ),
                        React.createElement(
                            'div',
                            { className: 'radar-icon' },
                            React.createElement('i', { className: 'fa fa-wifi' })
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'content' },
                    React.createElement(ProductSearchArea, { itemAddCallback: this.itemAddHandler, reset: this.state.searchReset, resetCallback: this.resetCallback })
                ),
                React.createElement(
                    'div',
                    { className: 'footer' },
                    React.createElement(
                        'ul',
                        { className: 'footer-help' },
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'span',
                                { className: 'help-badge' },
                                'F1'
                            ),
                            ' ',
                            React.createElement(
                                'span',
                                { className: 'help-text' },
                                'Сагс'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'span',
                                { className: 'help-badge' },
                                'F2'
                            ),
                            ' ',
                            React.createElement(
                                'span',
                                { className: 'help-text' },
                                'Хайлт'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'span',
                                { className: 'help-badge' },
                                'F10'
                            ),
                            ' ',
                            React.createElement(
                                'span',
                                { className: 'help-text' },
                                'Тооцоо хийх'
                            )
                        )
                    )
                )
            )
        );
    }
});
//# sourceMappingURL=pos.js.map

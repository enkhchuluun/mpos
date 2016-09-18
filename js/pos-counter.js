'use strict';

var PaymentModal = React.createClass({
    displayName: 'PaymentModal',

    getInitialState: function getInitialState() {
        return {
            paymentType: 'cash',
            cashReceived: this.props.total,
            cashReturn: 0
        };
    },
    componentDidMount: function componentDidMount() {

        /*setTimeout(function() {
         console.log('focus on did mount!!!: %o', this.cashReceivedInput );
         this.cashReceivedInput.focus();
         }.bind(this), 400);*/

        this.cashReceivedInput.focus();
    },
    componentDidUpdate: function componentDidUpdate() {
        console.log('focus on did update');
        this.cashReceivedInput.focus();
    },
    changeToCash: function changeToCash() {
        this.setState({
            paymentType: 'cash'
        });
    },
    changeToCard: function changeToCard() {
        this.setState({
            paymentType: 'card'
        });
    },
    handleTextChange: function handleTextChange() {
        var cashReceived = parseInt(this.cashReceivedInput.value);
        if (isNaN(cashReceived)) {
            cashReceived = 0;
        }
        var cashReturn = this.props.total - cashReceived;

        this.setState({
            cashReceived: cashReceived,
            cashReturn: cashReturn
        });
    },
    handleKeyDown: function handleKeyDown(event) {
        if (event.keyCode == 13) {
            event.preventDefault();

            this.printReceipt();
        }
    },
    handleFocus: function handleFocus() {
        console.log('has focus');
    },
    printReceipt: function printReceipt() {
        var orderData = {
            cashReceived: this.state.cashReceived,
            cashReturn: this.state.cashReturn,
            variantList: this.props.variantList
        };

        $.ajax({
            url: 'http://dev.merchant.jurur.mn/api/order/createPosOrder',
            dataType: 'json',
            method: 'POST',
            cache: false,
            data: JSON.stringify(orderData),
            processData: false,
            contentType: 'application/json',
            success: function (data) {
                if (data.error_code == 1000) {
                    var url = '/pos/printReceipt?orderNo=' + data.orderNo;

                    console.log('url:' + url);

                    var iframe = $('<iframe src="' + url + '" width="0" height="0" frameborder="0" id="printReceiptIframe" name="printReceiptIframe" />');

                    iframe.on('load', function () {
                        window.frames['printReceiptIframe'].focus();
                        window.frames['printReceiptIframe'].print();
                    });

                    $('#printIframeWrapper').html(iframe);

                    this.props.callBack();
                } else {
                    alert(data.message);
                    console.error('error:%O', data);
                }
            }.bind(this),
            error: function (xhr, status, err) {
                alert('серветэй холбогдоход алдаа гарлаа');
                console.error(url, status, err.toString());
            }.bind(this)
        });

        $('#paymentModal').modal('hide');

        var container = $('#paymentModal .modal-body')[0];
        ReactDOM.unmountComponentAtNode(container);
    },
    render: function render() {
        var cashBtnClass = 'btn btn-default btn-lg';
        var cardBtnClass = 'btn btn-default btn-lg';

        if (this.state.paymentType == 'cash') {
            cashBtnClass = 'btn btn-success btn-lg';
        }

        if (this.state.paymentType == 'card') {
            cardBtnClass = 'btn btn-success btn-lg';
        }

        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'div',
                    { className: 'form-group col-xs-6' },
                    React.createElement(
                        'label',
                        null,
                        'Төлбөрийн төрөл'
                    ),
                    React.createElement(
                        'div',
                        { className: 'btn-group' },
                        React.createElement(
                            'button',
                            { type: 'button', className: cashBtnClass, onClick: this.changeToCash },
                            React.createElement('i', { className: 'fa fa-money' }),
                            ' Бэлэн'
                        ),
                        React.createElement(
                            'button',
                            { type: 'button', className: cardBtnClass, onClick: this.changeToCard },
                            React.createElement('i', { className: 'fa fa-credit-card' }),
                            ' Карт'
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group col-xs-6' },
                    React.createElement(
                        'label',
                        null,
                        'Төлөх дүн'
                    ),
                    React.createElement(
                        'p',
                        { className: 'form-control-static text-lg' },
                        this.props.total,
                        '₮'
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'div',
                    { className: 'form-group col-xs-6' },
                    React.createElement(
                        'label',
                        null,
                        'Бэлэн авсан'
                    ),
                    React.createElement('input', { type: 'text', className: 'form-control', value: this.state.cashReceived, tabindex: '-2',
                        ref: function (input) {
                            this.cashReceivedInput = input;
                        }.bind(this),
                        onChange: this.handleTextChange,
                        onKeyDown: this.handleKeyDown,
                        autoFocus: true,
                        onFocus: this.handleFocus })
                ),
                React.createElement(
                    'div',
                    { className: 'form-group col-xs-6' },
                    React.createElement(
                        'label',
                        null,
                        'Хариулт'
                    ),
                    React.createElement(
                        'p',
                        { className: 'form-control-static' },
                        this.state.cashReturn,
                        '₮'
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'div',
                    { className: 'form-group text-center' },
                    React.createElement(
                        'button',
                        { type: 'button', className: 'btn btn-primary', onClick: this.printReceipt },
                        'Баримт хэвлэх'
                    )
                )
            )
        );
    }
});

var CounterItem = React.createClass({
    displayName: 'CounterItem',

    clickHandler: function clickHandler() {
        this.props.clickCallback(this.props.item);
    },
    render: function render() {
        var subPrice = numeral(this.props.item.price * this.props.item.selectedQuantity).format('0,0');
        var className = "counter-item";
        if (this.props.isSelected) {
            className = "counter-item active";
        }
        return React.createElement(
            'div',
            { className: className, onClick: this.clickHandler },
            React.createElement(
                'div',
                { className: 'counter-item-name' },
                React.createElement(
                    'span',
                    null,
                    this.props.item.productName
                )
            ),
            React.createElement(
                'div',
                { className: 'counter-item-qty' },
                this.props.item.selectedQuantity,
                'ш'
            ),
            React.createElement(
                'div',
                { className: 'counter-item-price' },
                subPrice,
                '₮'
            )
        );
    }
});

var CounterItemList = React.createClass({
    displayName: 'CounterItemList',

    getInitialState: function getInitialState() {
        return {
            selectedIndex: -1,
            quantityEditReset: true
        };
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        var selectedIndex = this.state.selectedIndex;

        if (nextProps.itemList.length == 0) {
            selectedIndex = -1;

            this.setState({ selectedIndex: selectedIndex });
        } else {
            if (selectedIndex >= nextProps.itemList.length) {
                selectedIndex = nextProps.itemList.length - 1;

                this.setState({ selectedIndex: selectedIndex });
            }
        }
    },
    componentDidMount: function componentDidMount() {
        console.log('key handler set up');
        window.addEventListener('keydown', this.handleCounterKey);
    },
    componentWillUnmount: function componentWillUnmount() {
        window.removeEventListener('keydown', this.handleCounterKey);
    },
    handleCounterKey: function handleCounterKey(event) {
        if (event.keyCode == 112) {
            //F1
            event.preventDefault();

            console.log('F1');

            this.setState({ selectedIndex: 0, quantityEditReset: true });
            this.rootDiv.focus();

            return;
        }

        if (event.keyCode == 121) {
            //F10
            event.preventDefault();

            console.log('F10');

            this.setState({ selectedIndex: -1, quantityEditReset: true });

            this.handlePayBtn();

            return;
        }
    },
    handleKeyDown: function handleKeyDown(event) {
        if (event.keyCode == 27) {
            //esc
            event.preventDefault();

            this.setState({ selectedIndex: -1, quantityEditReset: true });

            return;
        }

        if (event.keyCode == 40) {
            // down key
            event.preventDefault();

            if (this.props.itemList.length > 0) {
                var targetIndex = this.state.selectedIndex + 1;

                if (targetIndex >= this.props.itemList.length) {
                    targetIndex = 0;
                }

                this.setState({ selectedIndex: targetIndex, quantityEditReset: true });
            }

            return;
        }
        if (event.keyCode == 38) {
            //up key
            event.preventDefault();

            if (this.props.itemList.length > 0) {
                var targetIndex = this.state.selectedIndex - 1;

                if (targetIndex < 0) {
                    targetIndex = this.props.itemList.length - 1;
                }

                this.setState({ selectedIndex: targetIndex, quantityEditReset: true });
            }

            return;
        }

        if (event.keyCode == 107 || event.keyCode == 109 || event.keyCode == 110 || event.keyCode == 46 || event.keyCode == 8 || event.keyCode >= 96 && event.keyCode <= 105) {
            var removeItem = false;
            var backspace = false;
            var minusPlus = 0;
            var number = -1;
            var reset = true;

            if (event.keyCode == 107) {
                //plus key
                event.preventDefault();
                minusPlus = 1;
            }

            if (event.keyCode == 109) {
                //minus key
                event.preventDefault();
                minusPlus = -1;
            }

            if (event.keyCode == 110 || event.keyCode == 46) {
                //del, delete key
                event.preventDefault();
                removeItem = true;

                this.setState({
                    quantityEditReset: false
                });
            }

            if (event.keyCode >= 96 && event.keyCode <= 105) {
                //numpad 0~9 key
                number = event.keyCode - 96;

                if (this.state.quantityEditReset) {
                    reset = true;
                } else {
                    reset = false;
                }

                this.setState({
                    quantityEditReset: false
                });
            }

            if (event.keyCode == 8) {
                //backspace key
                backspace = true;
            }

            if (number != -1 || minusPlus != 0 || removeItem || backspace) {
                if (this.state.selectedIndex > -1) {
                    this.props.counterKeyActionCallback(this.state.selectedIndex, reset, number, minusPlus, removeItem, backspace);
                }
            }
        }
    },
    clickCallback: function clickCallback(targetItem) {
        var index = this.props.itemList.findIndex(function (item) {
            return item.key == targetItem.key;
        });

        this.setState({ selectedIndex: index, quantityEditReset: true });
    },
    handleKeyPad: function handleKeyPad(val) {
        console.log(val);

        var removeItem = false;
        var backspace = false;
        var minusPlus = 0;
        var number = -1;
        var reset = true;

        if (val == 1 || val == 2 || val == 3 || val == 4 || val == 5 || val == 6 || val == 7 || val == 8 || val == 9 || val == 0) {
            //numbers
            number = val;

            if (this.state.quantityEditReset) {
                reset = true;
            } else {
                reset = false;
            }

            this.setState({
                quantityEditReset: false
            });
        }

        if (val == 'backspace') {
            //backspace
            backspace = true;
        }

        if (number != -1 || minusPlus != 0 || removeItem || backspace) {
            if (this.state.selectedIndex > -1) {
                this.props.counterKeyActionCallback(this.state.selectedIndex, reset, number, minusPlus, removeItem, backspace);
            }
        }
    },
    handlePayBtn: function handlePayBtn() {
        console.debug('handlePayBtn');

        var variantList = [];

        this.props.itemList.forEach(function (item, i) {
            if (item.selectedQuantity > 0) {
                var orderData = {
                    productNo: item.productNo,
                    variantNo: item.variantNo,
                    selectedQuantity: item.selectedQuantity
                };

                variantList.push(orderData);
            }
        });

        if (variantList.length == 0) {
            return;
        }

        var info = this.calculate();

        $('#paymentModal').modal('show');

        var container = $('#paymentModal .modal-body')[0];

        ReactDOM.unmountComponentAtNode(container);

        var PaymentModalFactory = React.createFactory(PaymentModal);
        var _this = this;

        ReactDOM.render(PaymentModalFactory({ total: info.total, variantList: variantList, callBack: function callBack(orderNo) {
                console.log('orderNo:' + orderNo);

                _this.props.printCallback();
            } }), container);
    },
    handleCancelBtn: function handleCancelBtn() {
        console.debug('handleCancelBtn');

        this.props.printCallback();
    },
    calculate: function calculate() {
        var price = 0;
        var vat = 0;
        var total = 0;
        var itemCount = 0;

        this.props.itemList.forEach(function (item, i) {
            itemCount += item.selectedQuantity;
            total += item.price * item.selectedQuantity;
        });

        if (total > 0) {
            price = total;
            vat = total * 0.1;
        }

        return {
            itemCount: itemCount,
            price: price,
            vat: vat,
            total: total
        };
    },
    render: function render() {
        var counterItemList = [];
        var selectedIndex = this.state.selectedIndex;

        this.props.itemList.forEach(function (item, i) {
            var isSelected = false;
            if (selectedIndex == i) {
                isSelected = true;
            }
            counterItemList.push(React.createElement(CounterItem, { item: item, key: item.key, isSelected: isSelected, clickCallback: this.clickCallback }));
        }.bind(this));

        var info = this.calculate();

        var price = numeral(info.price).format('0,0');
        var vat = numeral(info.vat).format('0,0');
        var total = numeral(info.total).format('0,0');

        return React.createElement(
            'div',
            { className: 'counter-content' },
            React.createElement(
                'div',
                { className: 'counter-item-list', tabIndex: '3', onKeyDown: this.handleKeyDown, ref: function (div) {
                        this.rootDiv = div;
                    }.bind(this) },
                counterItemList
            ),
            React.createElement(
                'div',
                { className: 'counter-info' },
                React.createElement(
                    'div',
                    { className: 'counter-pay-info' },
                    React.createElement(
                        'div',
                        { className: 'price' },
                        React.createElement(
                            'span',
                            null,
                            'Нийт'
                        ),
                        ' ',
                        React.createElement(
                            'span',
                            null,
                            price,
                            '₮'
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'vat' },
                        React.createElement(
                            'span',
                            null,
                            'НӨАТ'
                        ),
                        ' ',
                        React.createElement(
                            'span',
                            null,
                            vat,
                            '₮'
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'total' },
                        React.createElement(
                            'span',
                            null,
                            'Төлөх дүн'
                        ),
                        ' ',
                        React.createElement(
                            'span',
                            null,
                            total,
                            '₮'
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'counter-pad' },
                    React.createElement(
                        'div',
                        { className: 'actionpad' },
                        React.createElement(
                            'button',
                            { className: 'button pay top-border left-border top-left-corner', onClick: this.handlePayBtn },
                            'Төлөх'
                        ),
                        React.createElement(
                            'button',
                            { className: 'button cancel left-border bottom-left-corner', onClick: this.handleCancelBtn },
                            'Цуцлах'
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'numpad' },
                        React.createElement(
                            'button',
                            { className: 'input-button number-char top-border', onClick: this.handleKeyPad.bind(this, 1) },
                            '1'
                        ),
                        React.createElement(
                            'button',
                            { className: 'input-button number-char top-border', onClick: this.handleKeyPad.bind(this, 2) },
                            '2'
                        ),
                        React.createElement(
                            'button',
                            { className: 'input-button number-char top-border top-right-corner', onClick: this.handleKeyPad.bind(this, 3) },
                            '3'
                        ),
                        React.createElement(
                            'button',
                            { className: 'input-button number-char', onClick: this.handleKeyPad.bind(this, 4) },
                            '4'
                        ),
                        React.createElement(
                            'button',
                            { className: 'input-button number-char', onClick: this.handleKeyPad.bind(this, 5) },
                            '5'
                        ),
                        React.createElement(
                            'button',
                            { className: 'input-button number-char', onClick: this.handleKeyPad.bind(this, 6) },
                            '6'
                        ),
                        React.createElement(
                            'button',
                            { className: 'input-button number-char', onClick: this.handleKeyPad.bind(this, 7) },
                            '7'
                        ),
                        React.createElement(
                            'button',
                            { className: 'input-button number-char', onClick: this.handleKeyPad.bind(this, 8) },
                            '8'
                        ),
                        React.createElement(
                            'button',
                            { className: 'input-button number-char', onClick: this.handleKeyPad.bind(this, 9) },
                            '9'
                        ),
                        React.createElement(
                            'button',
                            { className: 'input-button number-char' },
                            ' '
                        ),
                        React.createElement(
                            'button',
                            { className: 'input-button number-char', onClick: this.handleKeyPad.bind(this, 0) },
                            '0'
                        ),
                        React.createElement(
                            'button',
                            { className: 'input-button number-char bottom-right-corner', onClick: this.handleKeyPad.bind(this, 'backspace') },
                            React.createElement('i', { className: 'fa fa-remove' })
                        )
                    )
                )
            )
        );
    }
});

var PosCounter = React.createClass({
    displayName: 'PosCounter',

    getInitialState: function getInitialState() {
        return {
            time: moment()
        };
    },
    componentDidMount: function componentDidMount() {
        console.log('key handler set up');
        window.addEventListener('keydown', this.handleKeyDown);

        //set timer
        this.timer = setInterval(function () {
            var time = this.state.time.clone().add(1, 'minutes');

            this.setState({
                time: time
            });
        }.bind(this), 1000 * 60);
    },
    componentWillUnmount: function componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);

        console.log('will unmount');

        clearInterval(this.timer);
        this.timer = null;
    },
    render: function render() {
        var displayTime = this.state.time.format('YYYY/MM/DD HH:mm');

        return React.createElement(
            'div',
            { className: 'mm-pos-counter' },
            React.createElement(
                'div',
                { className: 'counter-header' },
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-xs-6' },
                        React.createElement(
                            'div',
                            { className: 'mm-pos-logo' },
                            React.createElement('img', { src: 'img/logo.png' })
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-xs-6' },
                        React.createElement(
                            'div',
                            null,
                            React.createElement(
                                'div',
                                { className: 'mm-pos-branch' },
                                this.props.branchName
                            ),
                            React.createElement(
                                'div',
                                { className: 'mm-pos-date' },
                                displayTime
                            )
                        )
                    )
                )
            ),
            React.createElement(CounterItemList, { itemList: this.props.itemList, counterKeyActionCallback: this.props.counterKeyActionCallback, printCallback: this.props.printCallback })
        );
    }
});
//# sourceMappingURL=pos-counter.js.map

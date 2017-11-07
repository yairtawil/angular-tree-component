import { Directive, Input, Renderer, TemplateRef, ViewContainerRef } from '@angular/core';
var EASE_ACCELERATION = 1.005;
var TreeAnimateOpenDirective = /** @class */ (function () {
    function TreeAnimateOpenDirective(renderer, templateRef, viewContainerRef) {
        this.renderer = renderer;
        this.templateRef = templateRef;
        this.viewContainerRef = viewContainerRef;
    }
    Object.defineProperty(TreeAnimateOpenDirective.prototype, "isOpen", {
        set: function (value) {
            if (value) {
                this._show();
                if (this.isEnabled && this._isOpen === false) {
                    this._animateOpen();
                }
            }
            else {
                this.isEnabled ? this._animateClose() : this._hide();
            }
            this._isOpen = !!value;
        },
        enumerable: true,
        configurable: true
    });
    ;
    TreeAnimateOpenDirective.prototype._show = function () {
        if (this.innerElement)
            return;
        // create child view
        this.innerElement = this.viewContainerRef.createEmbeddedView(this.templateRef).rootNodes[0];
    };
    TreeAnimateOpenDirective.prototype._hide = function () {
        this.viewContainerRef.clear();
        this.innerElement = null;
    };
    TreeAnimateOpenDirective.prototype._animateOpen = function () {
        var _this = this;
        var delta = this.animateSpeed;
        var ease = this.animateAcceleration;
        var maxHeight = 0;
        // set height to 0
        this.renderer.setElementStyle(this.innerElement, 'max-height', "0");
        // increase maxHeight until height doesn't change
        setTimeout(function () {
            var i = setInterval(function () {
                if (!_this._isOpen || !_this.innerElement)
                    return clearInterval(i);
                maxHeight += delta;
                var roundedMaxHeight = Math.round(maxHeight);
                _this.renderer.setElementStyle(_this.innerElement, 'max-height', roundedMaxHeight + "px");
                var height = _this.innerElement.getBoundingClientRect().height; // TBD use renderer
                delta *= ease;
                ease *= EASE_ACCELERATION;
                if (height < roundedMaxHeight) {
                    // Make maxHeight auto because animation finished and container might change height later on
                    _this.renderer.setElementStyle(_this.innerElement, 'max-height', null);
                    clearInterval(i);
                }
            }, 17);
        });
    };
    TreeAnimateOpenDirective.prototype._animateClose = function () {
        var _this = this;
        if (!this.innerElement)
            return;
        var delta = this.animateSpeed;
        var ease = this.animateAcceleration;
        var height = this.innerElement.getBoundingClientRect().height; // TBD use renderer
        // slowly decrease maxHeight to 0, starting from current height
        var i = setInterval(function () {
            if (_this._isOpen || !_this.innerElement)
                return clearInterval(i);
            height -= delta;
            _this.renderer.setElementStyle(_this.innerElement, 'max-height', height + "px");
            delta *= ease;
            ease *= EASE_ACCELERATION;
            if (height <= 0) {
                // after animation complete - remove child element
                _this.viewContainerRef.clear();
                _this.innerElement = null;
                clearInterval(i);
            }
        }, 17);
    };
    TreeAnimateOpenDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[treeAnimateOpen]'
                },] },
    ];
    /** @nocollapse */
    TreeAnimateOpenDirective.ctorParameters = function () { return [
        { type: Renderer, },
        { type: TemplateRef, },
        { type: ViewContainerRef, },
    ]; };
    TreeAnimateOpenDirective.propDecorators = {
        'animateSpeed': [{ type: Input, args: ['treeAnimateOpenSpeed',] },],
        'animateAcceleration': [{ type: Input, args: ['treeAnimateOpenAcceleration',] },],
        'isEnabled': [{ type: Input, args: ['treeAnimateOpenEnabled',] },],
        'isOpen': [{ type: Input, args: ['treeAnimateOpen',] },],
    };
    return TreeAnimateOpenDirective;
}());
export { TreeAnimateOpenDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9kaXJlY3RpdmVzL3RyZWUtYW5pbWF0ZS1vcGVuLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUFFLEtBQUEsRUFBcUIsUUFBQSxFQUN2QixXQUFBLEVBQWEsZ0JBQUEsRUFDdkIsTUFBTSxlQUFBLENBQWdCO0FBRXZCLElBQU0saUJBQUEsR0FBb0IsS0FBQSxDQUFNO0FBR2hDO0lBc0JFLGtDQUNVLFFBQWtCLEVBQ2xCLFdBQTZCLEVBQzdCLGdCQUFrQztRQUZsQyxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQ2xCLGdCQUFXLEdBQVgsV0FBVyxDQUFrQjtRQUM3QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO0lBQUcsQ0FBQztJQWpCaEQsc0JBQUksNENBQU07YUFBVixVQUFXLEtBQWM7WUFDdkIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDVixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQzdDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDdEIsQ0FBQztZQUNILENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN2RCxDQUFDO1lBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3pCLENBQUM7OztPQUFBO0lBQUEsQ0FBQztJQVNNLHdDQUFLLEdBQWI7UUFDRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQUMsTUFBTSxDQUFDO1FBRTlCLG9CQUFvQjtRQUNwQixJQUFJ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LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgRGlyZWN0aXZlLCBJbnB1dCwgSG9zdExpc3RlbmVyLCBSZW5kZXJlciwgRWxlbWVudFJlZixcclxuICBEb0NoZWNrLCBUZW1wbGF0ZVJlZiwgVmlld0NvbnRhaW5lclJlZlxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuY29uc3QgRUFTRV9BQ0NFTEVSQVRJT04gPSAxLjAwNTtcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgVHJlZUFuaW1hdGVPcGVuRGlyZWN0aXZlIHtcclxuICBwcml2YXRlIF9pc09wZW46IGJvb2xlYW47XHJcblxyXG4gICBhbmltYXRlU3BlZWQ6IG51bWJlcjtcclxuICAgYW5pbWF0ZUFjY2VsZXJhdGlvbjogbnVtYmVyO1xyXG4gICBpc0VuYWJsZWQ6IGJvb2xlYW47XHJcblxyXG4gIFxyXG4gIHNldCBpc09wZW4odmFsdWU6IGJvb2xlYW4pIHtcclxuICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICB0aGlzLl9zaG93KCk7XHJcbiAgICAgIGlmICh0aGlzLmlzRW5hYmxlZCAmJiB0aGlzLl9pc09wZW4gPT09IGZhbHNlKSB7XHJcbiAgICAgICAgdGhpcy5fYW5pbWF0ZU9wZW4oKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5pc0VuYWJsZWQgPyB0aGlzLl9hbmltYXRlQ2xvc2UoKSA6IHRoaXMuX2hpZGUoKTtcclxuICAgIH1cclxuICAgIHRoaXMuX2lzT3BlbiA9ICEhdmFsdWU7XHJcbiAgfTtcclxuXHJcbiAgcHJpdmF0ZSBpbm5lckVsZW1lbnQ6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJlbmRlcmVyOiBSZW5kZXJlcixcclxuICAgIHByaXZhdGUgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT4sXHJcbiAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYpIHt9XHJcblxyXG4gIHByaXZhdGUgX3Nob3coKSB7XHJcbiAgICBpZiAodGhpcy5pbm5lckVsZW1lbnQpIHJldHVybjtcclxuXHJcbiAgICAvLyBjcmVhdGUgY2hpbGQgdmlld1xyXG4gICAgdGhpcy5pbm5lckVsZW1lbnQgPSB0aGlzLnZpZXdDb250YWluZXJSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMudGVtcGxhdGVSZWYpLnJvb3ROb2Rlc1swXTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2hpZGUoKSB7XHJcbiAgICB0aGlzLnZpZXdDb250YWluZXJSZWYuY2xlYXIoKTtcclxuICAgIHRoaXMuaW5uZXJFbGVtZW50ID0gbnVsbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2FuaW1hdGVPcGVuKCkge1xyXG4gICAgbGV0IGRlbHRhID0gdGhpcy5hbmltYXRlU3BlZWQ7XHJcbiAgICBsZXQgZWFzZSA9IHRoaXMuYW5pbWF0ZUFjY2VsZXJhdGlvbjtcclxuICAgIGxldCBtYXhIZWlnaHQgPSAwO1xyXG5cclxuICAgIC8vIHNldCBoZWlnaHQgdG8gMFxyXG4gICAgdGhpcy5yZW5kZXJlci5zZXRFbGVtZW50U3R5bGUodGhpcy5pbm5lckVsZW1lbnQsICdtYXgtaGVpZ2h0JywgYDBgKTtcclxuXHJcbiAgICAvLyBpbmNyZWFzZSBtYXhIZWlnaHQgdW50aWwgaGVpZ2h0IGRvZXNuJ3QgY2hhbmdlXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHsgLy8gQWxsb3cgaW5uZXIgZWxlbWVudCB0byBjcmVhdGUgaXRzIGNvbnRlbnRcclxuICAgICAgY29uc3QgaSA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzT3BlbiB8fCAhdGhpcy5pbm5lckVsZW1lbnQpIHJldHVybiBjbGVhckludGVydmFsKGkpO1xyXG5cclxuICAgICAgICBtYXhIZWlnaHQgKz0gZGVsdGE7XHJcbiAgICAgICAgY29uc3Qgcm91bmRlZE1heEhlaWdodCA9IE1hdGgucm91bmQobWF4SGVpZ2h0KTtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zZXRFbGVtZW50U3R5bGUodGhpcy5pbm5lckVsZW1lbnQsICdtYXgtaGVpZ2h0JywgYCR7cm91bmRlZE1heEhlaWdodH1weGApO1xyXG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuaW5uZXJFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDsgLy8gVEJEIHVzZSByZW5kZXJlclxyXG5cclxuICAgICAgICBkZWx0YSAqPSBlYXNlO1xyXG4gICAgICAgIGVhc2UgKj0gRUFTRV9BQ0NFTEVSQVRJT047XHJcbiAgICAgICAgaWYgKGhlaWdodCA8IHJvdW5kZWRNYXhIZWlnaHQpIHtcclxuICAgICAgICAgIC8vIE1ha2UgbWF4SGVpZ2h0IGF1dG8gYmVjYXVzZSBhbmltYXRpb24gZmluaXNoZWQgYW5kIGNvbnRhaW5lciBtaWdodCBjaGFuZ2UgaGVpZ2h0IGxhdGVyIG9uXHJcbiAgICAgICAgICB0aGlzLnJlbmRlcmVyLnNldEVsZW1lbnRTdHlsZSh0aGlzLmlubmVyRWxlbWVudCwgJ21heC1oZWlnaHQnLCBudWxsKTtcclxuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCAxNyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2FuaW1hdGVDbG9zZSgpIHtcclxuICAgIGlmICghdGhpcy5pbm5lckVsZW1lbnQpIHJldHVybjtcclxuXHJcbiAgICBsZXQgZGVsdGEgPSB0aGlzLmFuaW1hdGVTcGVlZDtcclxuICAgIGxldCBlYXNlID0gdGhpcy5hbmltYXRlQWNjZWxlcmF0aW9uO1xyXG4gICAgbGV0IGhlaWdodCA9IHRoaXMuaW5uZXJFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDsgLy8gVEJEIHVzZSByZW5kZXJlclxyXG5cclxuICAgIC8vIHNsb3dseSBkZWNyZWFzZSBtYXhIZWlnaHQgdG8gMCwgc3RhcnRpbmcgZnJvbSBjdXJyZW50IGhlaWdodFxyXG4gICAgY29uc3QgaSA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuX2lzT3BlbiB8fCAhdGhpcy5pbm5lckVsZW1lbnQpIHJldHVybiBjbGVhckludGVydmFsKGkpO1xyXG5cclxuICAgICAgaGVpZ2h0IC09IGRlbHRhO1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLnNldEVsZW1lbnRTdHlsZSh0aGlzLmlubmVyRWxlbWVudCwgJ21heC1oZWlnaHQnLCBgJHtoZWlnaHR9cHhgKTtcclxuICAgICAgZGVsdGEgKj0gZWFzZTtcclxuICAgICAgZWFzZSAqPSBFQVNFX0FDQ0VMRVJBVElPTjtcclxuXHJcbiAgICAgIGlmIChoZWlnaHQgPD0gMCkge1xyXG4gICAgICAgIC8vIGFmdGVyIGFuaW1hdGlvbiBjb21wbGV0ZSAtIHJlbW92ZSBjaGlsZCBlbGVtZW50XHJcbiAgICAgICAgdGhpcy52aWV3Q29udGFpbmVyUmVmLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5pbm5lckVsZW1lbnQgPSBudWxsO1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoaSk7XHJcbiAgICAgIH1cclxuICAgIH0sIDE3KTtcclxuICB9XHJcbnN0YXRpYyBkZWNvcmF0b3JzOiBEZWNvcmF0b3JJbnZvY2F0aW9uW10gPSBbXG57IHR5cGU6IERpcmVjdGl2ZSwgYXJnczogW3tcclxuICBzZWxlY3RvcjogJ1t0cmVlQW5pbWF0ZU9wZW5dJ1xyXG59LCBdIH0sXG5dO1xuLyoqIEBub2NvbGxhcHNlICovXG5zdGF0aWMgY3RvclBhcmFtZXRlcnM6ICgpID0+ICh7dHlwZTogYW55LCBkZWNvcmF0b3JzPzogRGVjb3JhdG9ySW52b2NhdGlvbltdfXxudWxsKVtdID0gKCkgPT4gW1xue3R5cGU6IFJlbmRlcmVyLCB9LFxue3R5cGU6IFRlbXBsYXRlUmVmLCB9LFxue3R5cGU6IFZpZXdDb250YWluZXJSZWYsIH0sXG5dO1xuc3RhdGljIHByb3BEZWNvcmF0b3JzOiB7W2tleTogc3RyaW5nXTogRGVjb3JhdG9ySW52b2NhdGlvbltdfSA9IHtcbidhbmltYXRlU3BlZWQnOiBbeyB0eXBlOiBJbnB1dCwgYXJnczogWyd0cmVlQW5pbWF0ZU9wZW5TcGVlZCcsIF0gfSxdLFxuJ2FuaW1hdGVBY2NlbGVyYXRpb24nOiBbeyB0eXBlOiBJbnB1dCwgYXJnczogWyd0cmVlQW5pbWF0ZU9wZW5BY2NlbGVyYXRpb24nLCBdIH0sXSxcbidpc0VuYWJsZWQnOiBbeyB0eXBlOiBJbnB1dCwgYXJnczogWyd0cmVlQW5pbWF0ZU9wZW5FbmFibGVkJywgXSB9LF0sXG4naXNPcGVuJzogW3sgdHlwZTogSW5wdXQsIGFyZ3M6IFsndHJlZUFuaW1hdGVPcGVuJywgXSB9LF0sXG59O1xufVxyXG5cbmludGVyZmFjZSBEZWNvcmF0b3JJbnZvY2F0aW9uIHtcbiAgdHlwZTogRnVuY3Rpb247XG4gIGFyZ3M/OiBhbnlbXTtcbn1cbiJdfQ==
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { observable, computed, action, autorun, reaction } from 'mobx';
import { TreeModel } from './tree.model';
import { TREE_EVENTS } from '../constants/events';
var Y_OFFSET = 300; // Extra pixels outside the viewport, in each direction, to render nodes in
var Y_EPSILON = 50; // Minimum pixel change required to recalculate the rendered nodes
var TreeVirtualScroll = /** @class */ (function () {
    function TreeVirtualScroll(treeModel) {
        var _this = this;
        this.treeModel = treeModel;
        this.yBlocks = 0;
        this.x = 0;
        this.viewportHeight = null;
        this.viewport = null;
        treeModel.virtualScroll = this;
        this._dispose = [autorun(function () { return _this.fixScroll(); })];
    }
    Object.defineProperty(TreeVirtualScroll.prototype, "y", {
        get: function () {
            return this.yBlocks * Y_EPSILON;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeVirtualScroll.prototype, "totalHeight", {
        get: function () {
            return this.treeModel.virtualRoot ? this.treeModel.virtualRoot.height : 0;
        },
        enumerable: true,
        configurable: true
    });
    TreeVirtualScroll.prototype.fireEvent = function (event) {
        this.treeModel.fireEvent(event);
    };
    TreeVirtualScroll.prototype.init = function () {
        var _this = this;
        var fn = this.recalcPositions.bind(this);
        fn();
        this._dispose = this._dispose.concat([
            reaction(function () { return _this.treeModel.roots; }, fn),
            reaction(function () { return _this.treeModel.expandedNodeIds; }, fn),
            reaction(function () { return _this.treeModel.hiddenNodeIds; }, fn)
        ]);
        this.treeModel.subscribe(TREE_EVENTS.loadNodeChildren, fn);
    };
    TreeVirtualScroll.prototype.isEnabled = function () {
        return this.treeModel.options.useVirtualScroll;
    };
    TreeVirtualScroll.prototype._setYBlocks = function (value) {
        this.yBlocks = value;
    };
    TreeVirtualScroll.prototype.recalcPositions = function () {
        this.treeModel.virtualRoot.height = this._getPositionAfter(this.treeModel.getVisibleRoots(), 0);
    };
    TreeVirtualScroll.prototype._getPositionAfter = function (nodes, startPos) {
        var _this = this;
        var position = startPos;
        nodes.forEach(function (node) {
            node.position = position;
            position = _this._getPositionAfterNode(node, position);
        });
        return position;
    };
    TreeVirtualScroll.prototype._getPositionAfterNode = function (node, startPos) {
        var position = node.getSelfHeight() + startPos;
        if (node.children && node.isExpanded) {
            position = this._getPositionAfter(node.visibleChildren, position);
        }
        node.height = position - startPos;
        return position;
    };
    TreeVirtualScroll.prototype.clear = function () {
        this._dispose.forEach(function (d) { return d(); });
    };
    TreeVirtualScroll.prototype.setViewport = function (viewport) {
        Object.assign(this, {
            viewport: viewport,
            x: viewport.scrollLeft,
            yBlocks: Math.round(viewport.scrollTop / Y_EPSILON),
            viewportHeight: viewport.getBoundingClientRect().height
        });
    };
    TreeVirtualScroll.prototype.scrollIntoView = function (node, force, scrollToMiddle) {
        if (scrollToMiddle === void 0) { scrollToMiddle = true; }
        if (force || // force scroll to node
            node.position < this.y || // node is above viewport
            node.position + node.getSelfHeight() > this.y + this.viewportHeight) {
            if (this.viewport) {
                this.viewport.scrollTop = scrollToMiddle ?
                    node.position - this.viewportHeight / 2 : // scroll to middle
                    node.position; // scroll to start
                this._setYBlocks(Math.floor(this.viewport.scrollTop / Y_EPSILON));
            }
        }
    };
    TreeVirtualScroll.prototype.getViewportNodes = function (nodes) {
        var _this = this;
        if (!nodes)
            return [];
        var visibleNodes = nodes.filter(function (node) { return !node.isHidden; });
        if (!this.isEnabled())
            return visibleNodes;
        if (!this.viewportHeight || !visibleNodes.length)
            return [];
        // Search for first node in the viewport using binary search
        // Look for first node that starts after the beginning of the viewport (with buffer)
        // Or that ends after the beginning of the viewport
        var firstIndex = binarySearch(visibleNodes, function (node) {
            return (node.position + Y_OFFSET > _this.y) ||
                (node.position + node.height > _this.y);
        });
        // Search for last node in the viewport using binary search
        // Look for first node that starts after the end of the viewport (with buffer)
        var lastIndex = binarySearch(visibleNodes, function (node) {
            return node.position - Y_OFFSET > _this.y + _this.viewportHeight;
        }, firstIndex);
        var viewportNodes = [];
        for (var i = firstIndex; i <= lastIndex; i++) {
            viewportNodes.push(visibleNodes[i]);
        }
        return viewportNodes;
    };
    TreeVirtualScroll.prototype.fixScroll = function () {
        var maxY = Math.max(0, this.totalHeight - this.viewportHeight);
        if (this.y < 0)
            this._setYBlocks(0);
        if (this.y > maxY)
            this._setYBlocks(maxY / Y_EPSILON);
    };
    TreeVirtualScroll.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    TreeVirtualScroll.ctorParameters = function () { return [
        { type: TreeModel, },
    ]; };
    __decorate([
        observable,
        __metadata("design:type", Object)
    ], TreeVirtualScroll.prototype, "yBlocks", void 0);
    __decorate([
        observable,
        __metadata("design:type", Object)
    ], TreeVirtualScroll.prototype, "x", void 0);
    __decorate([
        observable,
        __metadata("design:type", Object)
    ], TreeVirtualScroll.prototype, "viewportHeight", void 0);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeVirtualScroll.prototype, "y", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeVirtualScroll.prototype, "totalHeight", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], TreeVirtualScroll.prototype, "_setYBlocks", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TreeVirtualScroll.prototype, "recalcPositions", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], TreeVirtualScroll.prototype, "setViewport", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object, Object, Object]),
        __metadata("design:returntype", void 0)
    ], TreeVirtualScroll.prototype, "scrollIntoView", null);
    return TreeVirtualScroll;
}());
export { TreeVirtualScroll };
function binarySearch(nodes, condition, firstIndex) {
    if (firstIndex === void 0) { firstIndex = 0; }
    var index = firstIndex;
    var toIndex = nodes.length - 1;
    while (index !== toIndex) {
        var midIndex = Math.floor((index + toIndex) / 2);
        if (condition(nodes[midIndex])) {
            toIndex = midIndex;
        }
        else {
            if (index === midIndex)
                index = toIndex;
            else
                index = midIndex;
        }
    }
    return index;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9tb2RlbHMvdHJlZS12aXJ0dWFsLXNjcm9sbC5tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBQSxFQUFXLE1BQU8sZUFBQSxDQUFnQjtBQUMzQyxPQUFPLEVBQUUsVUFBQSxFQUFZLFFBQUEsRUFBVSxNQUFBLEVBQVEsT0FBQSxFQUFTLFFBQUEsRUFBUyxNQUFPLE1BQUEsQ0FBTztBQUN2RSxPQUFPLEVBQUUsU0FBQSxFQUFVLE1BQU8sY0FBQSxDQUFlO0FBQ3pDLE9BQU8sRUFBRSxXQUFBLEVBQVksTUFBTyxxQkFBQSxDQUFzQjtBQUVsRCxJQUFNLFFBQUEsR0FBVyxHQUFBLENBQUksQ0FBQywyRUFBQTtBQUN0QixJQUFNLFNBQUEsR0FBWSxFQUFBLENBQUcsQ0FBQSxrRUFBQTtBQUdyQjtJQWdCRSwyQkFBb0IsU0FBb0I7UUFBeEMsaUJBR0M7UUFIbUIsY0FBUyxHQUFULFNBQVMsQ0FBVztRQWI1QixZQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ1osTUFBQyxHQUFHLENBQUMsQ0FBQztRQUNOLG1CQUFjLEdBQUcsSUFBSSxDQUFDO1FBQ2xDLGFBQVEsR0FBRyxJQUFJLENBQUM7UUFXZCxTQUFTLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUMvQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsU0FBUyxFQUFFLEVBQWhCLENBQWdCLENBQUMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFYUyxzQkFBSSxnQ0FBQzthQUFMO1lBQ1IsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO1FBQ2xDLENBQUM7OztPQUFBO0lBRVMsc0JBQUksMENBQVc7YUFBZjtZQUNSLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFB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R0FBRyxDQUFBLENBQUUsQ0FBQztRQVNqRCxFQUFFLENBQUMsQ0FBQyxTQVBDLENBQVMsS0FBQyxDQUFLLFFBQUMsQ0FBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBUTlCLE9BQU8sR0FQRyxRQUFBLENBQVM7UUFRckIsQ0FBQztRQUNELElBQUksQ0FQQyxDQUFBO1lBUUgsRUFBRSxDQUFDLENBQUMsS0FQQyxLQUFTLFFBQUEsQ0FBUztnQkFBQyxLQUFBLEdBQVEsT0FBQSxDQUFRO1lBUXhDLElBQUk7Z0JBUEMsS0FBQSxHQUFRLFFBQUEsQ0FBUztRQVF4QixDQUFDO0lBQ0gsQ0FBQztJQUNELE1BQU0sQ0FQQyxLQUFBLENBQU07QUFRZixDQUFDIiwiZmlsZSI6InRyZWUtdmlydHVhbC1zY3JvbGwubW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBvYnNlcnZhYmxlLCBjb21wdXRlZCwgYWN0aW9uLCBhdXRvcnVuLCByZWFjdGlvbiB9IGZyb20gJ21vYngnO1xyXG5pbXBvcnQgeyBUcmVlTW9kZWwgfSBmcm9tICcuL3RyZWUubW9kZWwnO1xyXG5pbXBvcnQgeyBUUkVFX0VWRU5UUyB9IGZyb20gJy4uL2NvbnN0YW50cy9ldmVudHMnO1xyXG5cclxuY29uc3QgWV9PRkZTRVQgPSAzMDA7IC8vIEV4dHJhIHBpeGVscyBvdXRzaWRlIHRoZSB2aWV3cG9ydCwgaW4gZWFjaCBkaXJlY3Rpb24sIHRvIHJlbmRlciBub2RlcyBpblxyXG5jb25zdCBZX0VQU0lMT04gPSA1MDsgLy8gTWluaW11bSBwaXhlbCBjaGFuZ2UgcmVxdWlyZWQgdG8gcmVjYWxjdWxhdGUgdGhlIHJlbmRlcmVkIG5vZGVzXHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFRyZWVWaXJ0dWFsU2Nyb2xsIHtcclxuICBwcml2YXRlIF9kaXNwb3NlOiBhbnk7XHJcblxyXG4gIEBvYnNlcnZhYmxlIHlCbG9ja3MgPSAwO1xyXG4gIEBvYnNlcnZhYmxlIHggPSAwO1xyXG4gIEBvYnNlcnZhYmxlIHZpZXdwb3J0SGVpZ2h0ID0gbnVsbDtcclxuICB2aWV3cG9ydCA9IG51bGw7XHJcblxyXG4gIEBjb21wdXRlZCBnZXQgeSgpIHtcclxuICAgIHJldHVybiB0aGlzLnlCbG9ja3MgKiBZX0VQU0lMT047XHJcbiAgfVxyXG5cclxuICBAY29tcHV0ZWQgZ2V0IHRvdGFsSGVpZ2h0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMudHJlZU1vZGVsLnZpcnR1YWxSb290ID8gdGhpcy50cmVlTW9kZWwudmlydHVhbFJvb3QuaGVpZ2h0IDogMDtcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgdHJlZU1vZGVsOiBUcmVlTW9kZWwpIHtcclxuICAgIHRyZWVNb2RlbC52aXJ0dWFsU2Nyb2xsID0gdGhpcztcclxuICAgIHRoaXMuX2Rpc3Bvc2UgPSBbYXV0b3J1bigoKSA9PiB0aGlzLmZpeFNjcm9sbCgpKV07XHJcbiAgfVxyXG5cclxuICBmaXJlRXZlbnQoZXZlbnQpIHtcclxuICAgIHRoaXMudHJlZU1vZGVsLmZpcmVFdmVudChldmVudCk7XHJcbiAgfVxyXG5cclxuICBpbml0KCkge1xyXG4gICAgY29uc3QgZm4gPSB0aGlzLnJlY2FsY1Bvc2l0aW9ucy5iaW5kKHRoaXMpO1xyXG5cclxuICAgIGZuKCk7XHJcbiAgICB0aGlzLl9kaXNwb3NlID0gW1xyXG4gICAgICAuLi50aGlzLl9kaXNwb3NlLFxyXG4gICAgICByZWFjdGlvbigoKSA9PiB0aGlzLnRyZWVNb2RlbC5yb290cywgZm4pLFxyXG4gICAgICByZWFjdGlvbigoKSA9PiB0aGlzLnRyZWVNb2RlbC5leHBhbmRlZE5vZGVJZHMsIGZuKSxcclxuICAgICAgcmVhY3Rpb24oKCkgPT4gdGhpcy50cmVlTW9kZWwuaGlkZGVuTm9kZUlkcywgZm4pXHJcbiAgICBdO1xyXG4gICAgdGhpcy50cmVlTW9kZWwuc3Vic2NyaWJlKFRSRUVfRVZFTlRTLmxvYWROb2RlQ2hpbGRyZW4sIGZuKTtcclxuICB9XHJcblxyXG4gIGlzRW5hYmxlZCgpIHtcclxuICAgIHJldHVybiB0aGlzLnRyZWVNb2RlbC5vcHRpb25zLnVzZVZpcnR1YWxTY3JvbGw7XHJcbiAgfVxyXG5cclxuICBAYWN0aW9uIHByaXZhdGUgX3NldFlCbG9ja3ModmFsdWUpIHtcclxuICAgIHRoaXMueUJsb2NrcyA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgQGFjdGlvbiByZWNhbGNQb3NpdGlvbnMoKSB7XHJcbiAgICB0aGlzLnRyZWVNb2RlbC52aXJ0dWFsUm9vdC5oZWlnaHQgPSB0aGlzLl9nZXRQb3NpdGlvbkFmdGVyKHRoaXMudHJlZU1vZGVsLmdldFZpc2libGVSb290cygpLCAwKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2dldFBvc2l0aW9uQWZ0ZXIobm9kZXMsIHN0YXJ0UG9zKSB7XHJcbiAgICBsZXQgcG9zaXRpb24gPSBzdGFydFBvcztcclxuXHJcbiAgICBub2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XHJcbiAgICAgIG5vZGUucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuICAgICAgcG9zaXRpb24gPSB0aGlzLl9nZXRQb3NpdGlvbkFmdGVyTm9kZShub2RlLCBwb3NpdGlvbik7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBwb3NpdGlvbjtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2dldFBvc2l0aW9uQWZ0ZXJOb2RlKG5vZGUsIHN0YXJ0UG9zKSB7XHJcbiAgICBsZXQgcG9zaXRpb24gPSBub2RlLmdldFNlbGZIZWlnaHQoKSArIHN0YXJ0UG9zO1xyXG5cclxuICAgIGlmIChub2RlLmNoaWxkcmVuICYmIG5vZGUuaXNFeHBhbmRlZCkgeyAvLyBUQkQ6IGNvbnNpZGVyIGxvYWRpbmcgY29tcG9uZW50IGFzIHdlbGxcclxuICAgICAgcG9zaXRpb24gPSB0aGlzLl9nZXRQb3NpdGlvbkFmdGVyKG5vZGUudmlzaWJsZUNoaWxkcmVuLCBwb3NpdGlvbik7XHJcbiAgICB9XHJcbiAgICBub2RlLmhlaWdodCA9IHBvc2l0aW9uIC0gc3RhcnRQb3M7XHJcbiAgICByZXR1cm4gcG9zaXRpb247XHJcbiAgfVxyXG5cclxuXHJcbiAgY2xlYXIoKSB7XHJcbiAgICB0aGlzLl9kaXNwb3NlLmZvckVhY2goKGQpID0+IGQoKSk7XHJcbiAgfVxyXG5cclxuICBAYWN0aW9uIHNldFZpZXdwb3J0KHZpZXdwb3J0KSB7XHJcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIHtcclxuICAgICAgdmlld3BvcnQsXHJcbiAgICAgIHg6IHZpZXdwb3J0LnNjcm9sbExlZnQsXHJcbiAgICAgIHlCbG9ja3M6IE1hdGgucm91bmQodmlld3BvcnQuc2Nyb2xsVG9wIC8gWV9FUFNJTE9OKSxcclxuICAgICAgdmlld3BvcnRIZWlnaHQ6IHZpZXdwb3J0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBAYWN0aW9uIHNjcm9sbEludG9WaWV3KG5vZGUsIGZvcmNlLCBzY3JvbGxUb01pZGRsZSA9IHRydWUpIHtcclxuICAgIGlmIChmb3JjZSB8fCAvLyBmb3JjZSBzY3JvbGwgdG8gbm9kZVxyXG4gICAgICBub2RlLnBvc2l0aW9uIDwgdGhpcy55IHx8IC8vIG5vZGUgaXMgYWJvdmUgdmlld3BvcnRcclxuICAgICAgbm9kZS5wb3NpdGlvbiArIG5vZGUuZ2V0U2VsZkhlaWdodCgpID4gdGhpcy55ICsgdGhpcy52aWV3cG9ydEhlaWdodCkgeyAvLyBub2RlIGlzIGJlbG93IHZpZXdwb3J0XHJcbiAgICAgIGlmICh0aGlzLnZpZXdwb3J0KSB7XHJcbiAgICAgICAgdGhpcy52aWV3cG9ydC5zY3JvbGxUb3AgPSBzY3JvbGxUb01pZGRsZSA/XHJcbiAgICAgICAgICBub2RlLnBvc2l0aW9uIC0gdGhpcy52aWV3cG9ydEhlaWdodCAvIDIgOiAvLyBzY3JvbGwgdG8gbWlkZGxlXHJcbiAgICAgICAgICBub2RlLnBvc2l0aW9uOyAvLyBzY3JvbGwgdG8gc3RhcnRcclxuXHJcbiAgICAgICAgdGhpcy5fc2V0WUJsb2NrcyhNYXRoLmZsb29yKHRoaXMudmlld3BvcnQuc2Nyb2xsVG9wIC8gWV9FUFNJTE9OKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldFZpZXdwb3J0Tm9kZXMobm9kZXMpIHtcclxuICAgIGlmICghbm9kZXMpIHJldHVybiBbXTtcclxuXHJcbiAgICBjb25zdCB2aXNpYmxlTm9kZXMgPSBub2Rlcy5maWx0ZXIoKG5vZGUpID0+ICFub2RlLmlzSGlkZGVuKTtcclxuXHJcbiAgICBpZiAoIXRoaXMuaXNFbmFibGVkKCkpIHJldHVybiB2aXNpYmxlTm9kZXM7XHJcblxyXG4gICAgaWYgKCF0aGlzLnZpZXdwb3J0SGVpZ2h0IHx8ICF2aXNpYmxlTm9kZXMubGVuZ3RoKSByZXR1cm4gW107XHJcblxyXG4gICAgLy8gU2VhcmNoIGZvciBmaXJzdCBub2RlIGluIHRoZSB2aWV3cG9ydCB1c2luZyBiaW5hcnkgc2VhcmNoXHJcbiAgICAvLyBMb29rIGZvciBmaXJzdCBub2RlIHRoYXQgc3RhcnRzIGFmdGVyIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHZpZXdwb3J0ICh3aXRoIGJ1ZmZlcilcclxuICAgIC8vIE9yIHRoYXQgZW5kcyBhZnRlciB0aGUgYmVnaW5uaW5nIG9mIHRoZSB2aWV3cG9ydFxyXG4gICAgY29uc3QgZmlyc3RJbmRleCA9IGJpbmFyeVNlYXJjaCh2aXNpYmxlTm9kZXMsIChub2RlKSA9PiB7XHJcbiAgICAgIHJldHVybiAobm9kZS5wb3NpdGlvbiArIFlfT0ZGU0VUID4gdGhpcy55KSB8fFxyXG4gICAgICAgICAgICAgKG5vZGUucG9zaXRpb24gKyBub2RlLmhlaWdodCA+IHRoaXMueSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTZWFyY2ggZm9yIGxhc3Qgbm9kZSBpbiB0aGUgdmlld3BvcnQgdXNpbmcgYmluYXJ5IHNlYXJjaFxyXG4gICAgLy8gTG9vayBmb3IgZmlyc3Qgbm9kZSB0aGF0IHN0YXJ0cyBhZnRlciB0aGUgZW5kIG9mIHRoZSB2aWV3cG9ydCAod2l0aCBidWZmZXIpXHJcbiAgICBjb25zdCBsYXN0SW5kZXggPSBiaW5hcnlTZWFyY2godmlzaWJsZU5vZGVzLCAobm9kZSkgPT4ge1xyXG4gICAgICByZXR1cm4gbm9kZS5wb3NpdGlvbiAtIFlfT0ZGU0VUID4gdGhpcy55ICsgdGhpcy52aWV3cG9ydEhlaWdodDtcclxuICAgIH0sIGZpcnN0SW5kZXgpO1xyXG5cclxuICAgIGNvbnN0IHZpZXdwb3J0Tm9kZXMgPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSBmaXJzdEluZGV4OyBpIDw9IGxhc3RJbmRleDsgaSsrKSB7XHJcbiAgICAgIHZpZXdwb3J0Tm9kZXMucHVzaCh2aXNpYmxlTm9kZXNbaV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2aWV3cG9ydE5vZGVzO1xyXG4gIH1cclxuXHJcbiAgZml4U2Nyb2xsKCkge1xyXG4gICAgY29uc3QgbWF4WSA9IE1hdGgubWF4KDAsIHRoaXMudG90YWxIZWlnaHQgLSB0aGlzLnZpZXdwb3J0SGVpZ2h0KTtcclxuXHJcbiAgICBpZiAodGhpcy55IDwgMCkgdGhpcy5fc2V0WUJsb2NrcygwKTtcclxuICAgIGlmICh0aGlzLnkgPiBtYXhZKSB0aGlzLl9zZXRZQmxvY2tzKG1heFkgLyBZX0VQU0lMT04pO1xyXG4gIH1cclxuc3RhdGljIGRlY29yYXRvcnM6IERlY29yYXRvckludm9jYXRpb25bXSA9IFtcbnsgdHlwZTogSW5qZWN0YWJsZSB9LFxuXTtcbi8qKiBAbm9jb2xsYXBzZSAqL1xuc3RhdGljIGN0b3JQYXJhbWV0ZXJzOiAoKSA9PiAoe3R5cGU6IGFueSwgZGVjb3JhdG9ycz86IERlY29yYXRvckludm9jYXRpb25bXX18bnVsbClbXSA9ICgpID0+IFtcbnt0eXBlOiBUcmVlTW9kZWwsIH0sXG5dO1xufVxyXG5cclxuZnVuY3Rpb24gYmluYXJ5U2VhcmNoKG5vZGVzLCBjb25kaXRpb24sIGZpcnN0SW5kZXggPSAwKSB7XHJcbiAgbGV0IGluZGV4ID0gZmlyc3RJbmRleDtcclxuICBsZXQgdG9JbmRleCA9IG5vZGVzLmxlbmd0aCAtIDE7XHJcblxyXG4gIHdoaWxlIChpbmRleCAhPT0gdG9JbmRleCkge1xyXG4gICAgbGV0IG1pZEluZGV4ID0gTWF0aC5mbG9vcigoaW5kZXggKyB0b0luZGV4KSAvIDIpO1xyXG5cclxuICAgIGlmIChjb25kaXRpb24obm9kZXNbbWlkSW5kZXhdKSkge1xyXG4gICAgICB0b0luZGV4ID0gbWlkSW5kZXg7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgaWYgKGluZGV4ID09PSBtaWRJbmRleCkgaW5kZXggPSB0b0luZGV4O1xyXG4gICAgICBlbHNlIGluZGV4ID0gbWlkSW5kZXg7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBpbmRleDtcclxufVxyXG5cbmludGVyZmFjZSBEZWNvcmF0b3JJbnZvY2F0aW9uIHtcbiAgdHlwZTogRnVuY3Rpb247XG4gIGFyZ3M/OiBhbnlbXTtcbn1cbiJdfQ==
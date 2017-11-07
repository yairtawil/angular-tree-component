import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobxAngularModule } from 'mobx-angular';
import { TREE_ACTIONS } from './models/tree-options.model';
import { KEYS } from './constants/keys';
import { TreeModel } from './models/tree.model';
import { TreeNode } from './models/tree-node.model';
import { TreeDraggedElement } from './models/tree-dragged-element.model';
import { TreeVirtualScroll } from './models/tree-virtual-scroll.model';
import { LoadingComponent } from './components/loading.component';
import { TreeComponent } from './components/tree.component';
import { TreeNodeComponent } from './components/tree-node.component';
import { TreeNodeContent } from './components/tree-node-content.component';
import { TreeNodeDropSlot } from './components/tree-node-drop-slot.component';
import { TreeNodeExpanderComponent } from './components/tree-node-expander.component';
import { TreeNodeChildrenComponent } from './components/tree-node-children.component';
import { TreeNodeCollectionComponent } from './components/tree-node-collection.component';
import { TreeNodeWrapperComponent } from './components/tree-node-wrapper.component';
import { TreeViewportComponent } from './components/tree-viewport.component';
import { TreeDropDirective } from './directives/tree-drop.directive';
import { TreeDragDirective } from './directives/tree-drag.directive';
import { TreeAnimateOpenDirective } from './directives/tree-animate-open.directive';
import './polyfills';
var TreeModule = /** @class */ (function () {
    function TreeModule() {
    }
    TreeModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [
                        TreeComponent,
                        TreeNodeComponent,
                        TreeNodeContent,
                        LoadingComponent,
                        TreeDropDirective,
                        TreeDragDirective,
                        TreeNodeExpanderComponent,
                        TreeNodeChildrenComponent,
                        TreeNodeDropSlot,
                        TreeNodeCollectionComponent,
                        TreeViewportComponent,
                        TreeNodeWrapperComponent,
                        TreeAnimateOpenDirective
                    ],
                    exports: [
                        TreeComponent,
                        TreeNodeComponent,
                        TreeNodeContent,
                        LoadingComponent,
                        TreeDropDirective,
                        TreeDragDirective,
                        TreeNodeExpanderComponent,
                        TreeNodeChildrenComponent,
                        TreeNodeDropSlot,
                        TreeNodeCollectionComponent,
                        TreeViewportComponent,
                        TreeNodeWrapperComponent,
                        TreeAnimateOpenDirective
                    ],
                    imports: [
                        CommonModule,
                        MobxAngularModule
                    ],
                    providers: [
                        TreeDraggedElement
                    ]
                },] },
    ];
    /** @nocollapse */
    TreeModule.ctorParameters = function () { return []; };
    return TreeModule;
}());
export { TreeModule };
export { TreeModel, TreeNode, TreeDraggedElement, TreeVirtualScroll, TREE_ACTIONS, KEYS, LoadingComponent, TreeComponent, TreeNodeComponent, TreeNodeContent, TreeDropDirective, TreeDragDirective, TreeNodeExpanderComponent, TreeNodeChildrenComponent, TreeNodeDropSlot, TreeNodeCollectionComponent, TreeViewportComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9hbmd1bGFyLXRyZWUtY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFBLEVBQVMsTUFBWSxlQUFBLENBQWdCO0FBQzlDLE9BQU8sRUFBRSxZQUFBLEVBQWEsTUFBTyxpQkFBQSxDQUFrQjtBQUMvQyxPQUFPLEVBQUUsaUJBQUEsRUFBa0IsTUFBTyxjQUFBLENBQWU7QUFFakQsT0FBTyxFQUFFLFlBQUEsRUFBNkMsTUFBTyw2QkFBQSxDQUE4QjtBQUUzRixPQUFPLEVBQUUsSUFBQSxFQUFLLE1BQU8sa0JBQUEsQ0FBbUI7QUFDeEMsT0FBTyxFQUFFLFNBQUEsRUFBVSxNQUFPLHFCQUFBLENBQXNCO0FBQ2hELE9BQU8sRUFBRSxRQUFBLEVBQVMsTUFBTywwQkFBQSxDQUEyQjtBQUNwRCxPQUFPLEVBQUUsa0JBQUEsRUFBbUIsTUFBTyxxQ0FBQSxDQUFzQztBQUN6RSxPQUFPLEVBQUUsaUJBQUEsRUFBa0IsTUFBTyxvQ0FBQSxDQUFxQztBQUN2RSxPQUFPLEVBQUUsZ0JBQUEsRUFBaUIsTUFBTyxnQ0FBQSxDQUFpQztBQUNsRSxPQUFPLEVBQUUsYUFBQSxFQUFjLE1BQU8sNkJBQUEsQ0FBOEI7QUFDNUQsT0FBTyxFQUFFLGlCQUFBLEVBQWtCLE1BQU8sa0NBQUEsQ0FBbUM7QUFDckUsT0FBTyxFQUFFLGVBQUEsRUFBZ0IsTUFBTywwQ0FBQSxDQUEyQztBQUMzRSxPQUFPLEVBQUUsZ0JBQUEsRUFBaUIsTUFBTyw0Q0FBQSxDQUE2QztBQUM5RSxPQUFPLEVBQUUseUJBQUEsRUFBMEIsTUFBTywyQ0FBQSxDQUE0QztBQUN0RixPQUFPLEVBQUUseUJBQUEsRUFBMEIsTUFBTywyQ0FBQSxDQUE0QztBQUN0RixPQUFPLEVBQUUsMkJBQUEsRUFBNEIsTUFBTyw2Q0FBQSxDQUE4QztBQUMxRixPQUFPLEVBQUUsd0JBQUEsRUFBeUIsTUFBTywwQ0FBQSxDQUEyQztBQUNwRixPQUFPLEVBQUUscUJBQUEsRUFBc0IsTUFBTyxzQ0FBQSxDQUF1QztBQUM3RSxPQUFPLEVBQUUsaUJBQUEsRUFBa0IsTUFBTyxrQ0FBQSxDQUFtQztBQUNyRSxPQUFPLEVBQUUsaUJBQUEsRUFBa0IsTUFBTyxrQ0FBQSxDQUFtQztBQUNyRSxPQUFPLEVBQUUsd0JBQUEsRUFBeUIsTUFBTywwQ0FBQSxDQUEyQztBQUVwRixPQUFPLGFBQUEsQ0FBYztBQUdyQjtJQUFBO0lBNENBLENBQUM7SUE1QytCLHFCQUFVLEdBQTBCO1FBQ3BFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQztvQkFDdkIsWUFBWSxFQUFFO3dCQUNaLGFBQWE7d0JBQ2IsaUJBQWlCO3dCQUNqQixlQUFlO3dCQUNmLGdCQUFnQjt3QkFDaEIsaUJBQWlCO3dCQUNqQixpQkFBaUI7d0JBQ2pCLHlCQUF5Qjt3QkFDekIseUJBQXlCO3dCQUN6QixnQkFBZ0I7d0JBQ2hCLDJCQUEyQjt3QkFDM0IscUJBQXFCO3dCQUNyQix3QkFBd0I7d0JBQ3hCLHdCQUF3QjtxQkFDekI7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLGFBQWE7d0JBQ2IsaUJBQWlCO3dCQUNqQixlQUFlO3dCQUNmLGdCQUFnQjt3QkFDaEIsaUJBQWlCO3dCQUNqQixpQkFBaUI7d0JBQ2pCLHlCQUF5Qjt3QkFDekIseUJBQXlCO3dCQUN6QixnQkFBZ0I7d0JBQ2hCLDJCQUEyQjt3QkFDM0IscUJBQXFCO3dCQUNyQix3QkFBd0I7d0JBQ3hCLHdCQUF3QjtxQkFDekI7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLFlBQVk7d0JBQ1osaUJBQWlCO3FCQUNsQjtvQkFDRCxTQUFTLEVBQUU7d0JBQ1Qsa0JBQWtCO3FCQUNuQjtpQkFDRixFQUFHLEVBQUU7S0FDTCxDQUFDO0lBQ0Ysa0JBQWtCO0lBQ1gseUJBQWMsR0FBbUUsY0FBTSxPQUFBLEVBQzdGLEVBRDZGLENBQzdGLENBQUM7SUFDRixpQkFBQztDQTVDRCxBQTRDQyxJQUFBO1NBNUNZLFVBQVU7QUE4Q3ZCLE9BTk8sRUFPTCxTQUFTLEVBQ1QsUUFBUSxFQUNSLGtCQUFrQixFQUNsQixpQkFBaUIsRUFFakIsWUFBWSxFQUNaLElBQUksRUFLSixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLGlCQUFpQixFQUNqQixlQUFlLEVBQ2YsaUJBQWlCLEVBQ2pCLGlCQUFpQixFQUNqQix5QkFBeUIsRUFDekIseUJBQXlCLEVBQ3pCLGdCQUFnQixFQUNoQiwyQkFBMkIsRUFDM0IscUJBQXFCLEVBRXRCLENBTkMiLCJmaWxlIjoiYW5ndWxhci10cmVlLWNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9ICAgICAgZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IE1vYnhBbmd1bGFyTW9kdWxlIH0gZnJvbSAnbW9ieC1hbmd1bGFyJztcclxuXHJcbmltcG9ydCB7IFRSRUVfQUNUSU9OUywgSUFjdGlvbk1hcHBpbmcsIElBY3Rpb25IYW5kbGVyIH0gZnJvbSAnLi9tb2RlbHMvdHJlZS1vcHRpb25zLm1vZGVsJztcclxuaW1wb3J0IHsgSVRyZWVPcHRpb25zLCBJQWxsb3dEcm9wRm4sIElBbGxvd0RyYWdGbiwgSVRyZWVTdGF0ZSB9IGZyb20gJy4vZGVmcy9hcGknO1xyXG5pbXBvcnQgeyBLRVlTIH0gZnJvbSAnLi9jb25zdGFudHMva2V5cyc7XHJcbmltcG9ydCB7IFRyZWVNb2RlbCB9IGZyb20gJy4vbW9kZWxzL3RyZWUubW9kZWwnO1xyXG5pbXBvcnQgeyBUcmVlTm9kZSB9IGZyb20gJy4vbW9kZWxzL3RyZWUtbm9kZS5tb2RlbCc7XHJcbmltcG9ydCB7IFRyZWVEcmFnZ2VkRWxlbWVudCB9IGZyb20gJy4vbW9kZWxzL3RyZWUtZHJhZ2dlZC1lbGVtZW50Lm1vZGVsJztcclxuaW1wb3J0IHsgVHJlZVZpcnR1YWxTY3JvbGwgfSBmcm9tICcuL21vZGVscy90cmVlLXZpcnR1YWwtc2Nyb2xsLm1vZGVsJztcclxuaW1wb3J0IHsgTG9hZGluZ0NvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy9sb2FkaW5nLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFRyZWVDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvdHJlZS5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBUcmVlTm9kZUNvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy90cmVlLW5vZGUuY29tcG9uZW50JztcclxuaW1wb3J0IHsgVHJlZU5vZGVDb250ZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL3RyZWUtbm9kZS1jb250ZW50LmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFRyZWVOb2RlRHJvcFNsb3QgfSBmcm9tICcuL2NvbXBvbmVudHMvdHJlZS1ub2RlLWRyb3Atc2xvdC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBUcmVlTm9kZUV4cGFuZGVyQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL3RyZWUtbm9kZS1leHBhbmRlci5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBUcmVlTm9kZUNoaWxkcmVuQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL3RyZWUtbm9kZS1jaGlsZHJlbi5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBUcmVlTm9kZUNvbGxlY3Rpb25Db21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudHMvdHJlZS1ub2RlLWNvbGxlY3Rpb24uY29tcG9uZW50JztcclxuaW1wb3J0IHsgVHJlZU5vZGVXcmFwcGVyQ29tcG9uZW50IH0gZnJvbSAnLi9jb21wb25lbnRzL3RyZWUtbm9kZS13cmFwcGVyLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFRyZWVWaWV3cG9ydENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50cy90cmVlLXZpZXdwb3J0LmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFRyZWVEcm9wRGlyZWN0aXZlIH0gZnJvbSAnLi9kaXJlY3RpdmVzL3RyZWUtZHJvcC5kaXJlY3RpdmUnO1xyXG5pbXBvcnQgeyBUcmVlRHJhZ0RpcmVjdGl2ZSB9IGZyb20gJy4vZGlyZWN0aXZlcy90cmVlLWRyYWcuZGlyZWN0aXZlJztcclxuaW1wb3J0IHsgVHJlZUFuaW1hdGVPcGVuRGlyZWN0aXZlIH0gZnJvbSAnLi9kaXJlY3RpdmVzL3RyZWUtYW5pbWF0ZS1vcGVuLmRpcmVjdGl2ZSc7XHJcblxyXG5pbXBvcnQgJy4vcG9seWZpbGxzJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgVHJlZU1vZHVsZSB7c3RhdGljIGRlY29yYXRvcnM6IERlY29yYXRvckludm9jYXRpb25bXSA9IFtcbnsgdHlwZTogTmdNb2R1bGUsIGFyZ3M6IFt7XHJcbiAgZGVjbGFyYXRpb25zOiBbXHJcbiAgICBUcmVlQ29tcG9uZW50LFxyXG4gICAgVHJlZU5vZGVDb21wb25lbnQsXHJcbiAgICBUcmVlTm9kZUNvbnRlbnQsXHJcbiAgICBMb2FkaW5nQ29tcG9uZW50LFxyXG4gICAgVHJlZURyb3BEaXJlY3RpdmUsXHJcbiAgICBUcmVlRHJhZ0RpcmVjdGl2ZSxcclxuICAgIFRyZWVOb2RlRXhwYW5kZXJDb21wb25lbnQsXHJcbiAgICBUcmVlTm9kZUNoaWxkcmVuQ29tcG9uZW50LFxyXG4gICAgVHJlZU5vZGVEcm9wU2xvdCxcclxuICAgIFRyZWVOb2RlQ29sbGVjdGlvbkNvbXBvbmVudCxcclxuICAgIFRyZWVWaWV3cG9ydENvbXBvbmVudCxcclxuICAgIFRyZWVOb2RlV3JhcHBlckNvbXBvbmVudCxcclxuICAgIFRyZWVBbmltYXRlT3BlbkRpcmVjdGl2ZVxyXG4gIF0sXHJcbiAgZXhwb3J0czogW1xyXG4gICAgVHJlZUNvbXBvbmVudCxcclxuICAgIFRyZWVOb2RlQ29tcG9uZW50LFxyXG4gICAgVHJlZU5vZGVDb250ZW50LFxyXG4gICAgTG9hZGluZ0NvbXBvbmVudCxcclxuICAgIFRyZWVEcm9wRGlyZWN0aXZlLFxyXG4gICAgVHJlZURyYWdEaXJlY3RpdmUsXHJcbiAgICBUcmVlTm9kZUV4cGFuZGVyQ29tcG9uZW50LFxyXG4gICAgVHJlZU5vZGVDaGlsZHJlbkNvbXBvbmVudCxcclxuICAgIFRyZWVOb2RlRHJvcFNsb3QsXHJcbiAgICBUcmVlTm9kZUNvbGxlY3Rpb25Db21wb25lbnQsXHJcbiAgICBUcmVlVmlld3BvcnRDb21wb25lbnQsXHJcbiAgICBUcmVlTm9kZVdyYXBwZXJDb21wb25lbnQsXHJcbiAgICBUcmVlQW5pbWF0ZU9wZW5EaXJlY3RpdmVcclxuICBdLFxyXG4gIGltcG9ydHM6IFtcclxuICAgIENvbW1vbk1vZHVsZSxcclxuICAgIE1vYnhBbmd1bGFyTW9kdWxlXHJcbiAgXSxcclxuICBwcm92aWRlcnM6IFtcclxuICAgIFRyZWVEcmFnZ2VkRWxlbWVudFxyXG4gIF1cclxufSwgXSB9LFxuXTtcbi8qKiBAbm9jb2xsYXBzZSAqL1xuc3RhdGljIGN0b3JQYXJhbWV0ZXJzOiAoKSA9PiAoe3R5cGU6IGFueSwgZGVjb3JhdG9ycz86IERlY29yYXRvckludm9jYXRpb25bXX18bnVsbClbXSA9ICgpID0+IFtcbl07XG59XHJcblxyXG5leHBvcnQge1xyXG4gIFRyZWVNb2RlbCxcclxuICBUcmVlTm9kZSxcclxuICBUcmVlRHJhZ2dlZEVsZW1lbnQsXHJcbiAgVHJlZVZpcnR1YWxTY3JvbGwsXHJcbiAgSVRyZWVPcHRpb25zLFxyXG4gIFRSRUVfQUNUSU9OUyxcclxuICBLRVlTLFxyXG4gIElBY3Rpb25NYXBwaW5nLFxyXG4gIElBY3Rpb25IYW5kbGVyLFxyXG4gIElBbGxvd0Ryb3BGbixcclxuICBJQWxsb3dEcmFnRm4sXHJcbiAgTG9hZGluZ0NvbXBvbmVudCxcclxuICBUcmVlQ29tcG9uZW50LFxyXG4gIFRyZWVOb2RlQ29tcG9uZW50LFxyXG4gIFRyZWVOb2RlQ29udGVudCxcclxuICBUcmVlRHJvcERpcmVjdGl2ZSxcclxuICBUcmVlRHJhZ0RpcmVjdGl2ZSxcclxuICBUcmVlTm9kZUV4cGFuZGVyQ29tcG9uZW50LFxyXG4gIFRyZWVOb2RlQ2hpbGRyZW5Db21wb25lbnQsXHJcbiAgVHJlZU5vZGVEcm9wU2xvdCxcclxuICBUcmVlTm9kZUNvbGxlY3Rpb25Db21wb25lbnQsXHJcbiAgVHJlZVZpZXdwb3J0Q29tcG9uZW50LFxyXG4gIElUcmVlU3RhdGVcclxufTtcclxuXG5pbnRlcmZhY2UgRGVjb3JhdG9ySW52b2NhdGlvbiB7XG4gIHR5cGU6IEZ1bmN0aW9uO1xuICBhcmdzPzogYW55W107XG59XG4iXX0=
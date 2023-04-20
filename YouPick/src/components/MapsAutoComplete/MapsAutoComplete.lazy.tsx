import React, { lazy, Suspense } from "react";
import { MapsAutoCompleteProps } from "./MapsAutoComplete";
const LazyMapsAutoComplete = lazy(() => import("./MapsAutoComplete"));

const MapsAutoComplete = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & MapsAutoCompleteProps
) => (
    <Suspense fallback={null}>
        <LazyMapsAutoComplete {...props} />
    </Suspense>
);

export default MapsAutoComplete;

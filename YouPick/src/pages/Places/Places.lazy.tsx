import React, { lazy, Suspense } from "react";
import { PlacesProps } from "./Places";
const LazyPlaces = lazy(() => import("./Places"));

const Places = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & PlacesProps
) => (
    <Suspense fallback={null}>
        <LazyPlaces {...props} />
    </Suspense>
);

export default Places;

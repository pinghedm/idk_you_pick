import React, { lazy, Suspense } from "react";
import { FindPlaceProps } from "./FindPlace";
const LazyFindPlace = lazy(() => import("./FindPlace"));

const FindPlace = (
    props: JSX.IntrinsicAttributes & {
        children?: React.ReactNode;
    } & FindPlaceProps
) => (
    <Suspense fallback={null}>
        <LazyFindPlace {...props} />
    </Suspense>
);

export default FindPlace;

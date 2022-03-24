import React from "react";
import {/*prettyDOM, */render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Pagination from "./Pagination";

test("renders correctly with handler functions", () => {

    const CURRENT_PAGE = 2;
    const LAST_PAGE = false;
    const handleNext = jest.fn();
    const handlePrevious = jest.fn();
    render(<Pagination
        currentPage={2}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        lastPage={LAST_PAGE}
    />);

    const buttonElements = screen.getAllByRole("button");  // Relies on HTML default
    checkButtonElements(buttonElements, CURRENT_PAGE);

    userEvent.click(buttonElements[0]);
    userEvent.click(buttonElements[2]);
    expect(handleNext.mock.calls.length).toBe(1);
    expect(handlePrevious.mock.calls.length).toBe(1);

});

test("renders correctly with minimal properties", () => {

    const CURRENT_PAGE = 2;
    const LAST_PAGE = false;
    render(<Pagination
        currentPage={CURRENT_PAGE}
        lastPage={LAST_PAGE}
    />);

    const buttonElements = screen.getAllByRole("button");  // Relies on HTML default
    checkButtonElements(buttonElements, CURRENT_PAGE);

});

const checkButtonElements = (buttonElements: HTMLElement[], currentPage: number): void => {
    expect(buttonElements.length).toBe(3);
    buttonElements.forEach(buttonElement => {
        if (buttonElement.textContent === ("" + currentPage)) {
            expect(buttonElement).toBeDisabled();
        } else {
            expect(buttonElement).toBeEnabled();
        }
    });
}

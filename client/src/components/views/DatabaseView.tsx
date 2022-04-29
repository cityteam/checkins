// DatabaseView --------------------------------------------------------------

// Interface for performing database management and administrative tasks.

// External Modules ----------------------------------------------------------

import React, {useState} from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import {MutatingProgress} from "@craigmcc/shared-react";

// Internal Modules ----------------------------------------------------------

import useMutateDatabase from "../../hooks/useMutateDatabase";

// Component Details ---------------------------------------------------------

const DatabaseView = () => {

    const [results, setResults] = useState<string | null>(null);

    const mutateDatabase = useMutateDatabase({});

    const handleBackup = async () => {
        const theResults = await mutateDatabase.backup();
        setResults(JSON.stringify(theResults, null, 2));
    }

    return (
        <Container fluid id="DatabaseView">

            <MutatingProgress
                error={mutateDatabase.error}
                executing={mutateDatabase.executing}
                message="Backing up database"/>

            <Row className="mb-3 ml-1 mr-1">
                <Col className="text-left">
                    <span><strong>Database Management Operations</strong></span>
                </Col>
            </Row>

            <Row className="mb-3 ml-1 mr-1">
                <Col className="text-right">
                    <Button
                        onClick={handleBackup}
                        size="sm"
                        variant="success"
                    >Backup</Button>
                </Col>
                <Col className="text-left">
                    <span>Request a database backup</span>
                </Col>
            </Row>

            {(results) ? (
                <>
                    <hr/>
                    <Row className="ml-1 mr-1">
                        <Col className="text-center mb-3">
                            Database Operation Results
                        </Col>
                    </Row>
                    <Row className="ml-1 mr-1">
                        <Col className="text-center">
                        <textarea
                            cols={125}
                            disabled
                            readOnly
                            rows={25}
                            value={results}
                        />
                        </Col>
                    </Row>
                </>
            ) : null}

        </Container>
    )

}

export default DatabaseView;

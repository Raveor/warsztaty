import React from "react";
import PropTypes from "prop-types";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

const registerURL = "http://localhost:3000/auth/register";

const registerSchema = Yup.object().shape({
    username: Yup.string().required("Required"),
    email: Yup.string()
        .email("Invalid email")
        .required("Required"),
    password: Yup.string().required("Required"),
    passwordConfirmation: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Required")
});

function getErrMsg(res) {
    if (res) {
        if (res.result === "error" && res.message) {
            return res.message;
        }
    }
    return "An error occured";
}

const RegisterPasswordForm = ({ onSuccess }) => {
    return (
        <div>
            <Formik
                initialValues={{
                    username: "",
                    email: "",
                    password: "",
                    passwordConfirmation: ""
                }}
                validationSchema={registerSchema}
                onSubmit={(values, actions) => {
                    console.log(JSON.stringify(values, null, 4));
                    const request = new Request(registerURL, {
                        method: "POST",
                        body: JSON.stringify(values),
                        headers: { "Content-Type": "application/json" }
                    });
                    fetch(request)
                        .then(response => response.json())
                        .then(res => {
                            console.log(res);
                            actions.setSubmitting(false);
                            if (res.result === "ok") {
                                onSuccess();
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            actions.setSubmitting(false);
                            actions.setStatus({ msg: getErrMsg(err) });
                        });
                }}
                render={({ errors, status, touched, isSubmitting }) => (
                    <Form>
                        <div>
                            Username:
                            <Field type="text" name="username" />
                            <ErrorMessage name="username" component="div" />
                        </div>
                        <div>
                            Email:
                            <Field type="email" name="email" />
                            <ErrorMessage name="email" component="div" />
                        </div>
                        <div>
                            Password:
                            <Field type="password" name="password" />
                            <ErrorMessage name="password" component="div" />
                        </div>
                        <div>
                            Confirm password:
                            <Field type="password" name="passwordConfirmation" />
                            <ErrorMessage
                                name="passwordConfirmation"
                                component="div"
                            />
                        </div>
                        {status && status.msg && <div>{status.msg}</div>}
                        <button type="submit" disabled={isSubmitting}>
                            Register
                        </button>
                    </Form>
                )}
            />
        </div>
    );
};

RegisterPasswordForm.propTypes = {
    onSuccess: PropTypes.func.isRequired
};

export default RegisterPasswordForm;

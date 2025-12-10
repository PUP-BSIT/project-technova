package com.campus.facility_reservation.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark methods that should be audited.
 * Usage: @Audited(action = "CREATE", table = "users")
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Audited {
    /**
     * The action being performed (e.g., CREATE, UPDATE, DELETE, LOGIN)
     */
    String action();

    /**
     * The database table or entity being affected
     */
    String table();

    /**
     * Optional: description of the action
     */
    String description() default "";
}
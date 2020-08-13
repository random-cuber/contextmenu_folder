
### Sample proper build path for Eclipse PHP (PDT)

Note
* `vendor/roundcube/program` is link or copy to the local workspace install of roundcube

```xml
<?xml version="1.0" encoding="UTF-8"?>
<buildpath>

    <buildpathentry kind="src" path="vendor/roundcube/program"/>

    <buildpathentry excluding="semver/" kind="src" path="vendor/composer">
        <attributes>
            <attribute name="composer" value="vendor"/>
        </attributes>
    </buildpathentry>
    <buildpathentry kind="src" path="vendor/composer/semver/src">
        <attributes>
            <attribute name="composer" value="vendor"/>
        </attributes>
    </buildpathentry>
    <buildpathentry kind="src" path="vendor/roundcube/plugin-installer/src">
        <attributes>
            <attribute name="composer" value="vendor"/>
        </attributes>
    </buildpathentry>

</buildpath>

```

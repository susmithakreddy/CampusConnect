# Generated by Django 5.1 on 2025-04-11 08:30

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ExternalAttendance',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('student_id', models.IntegerField()),
                ('course_id', models.IntegerField()),
                ('date', models.DateField()),
                ('present', models.BooleanField(default=True)),
            ],
            options={
                'db_table': 'student_attendance',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='ExternalCollege',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
            ],
            options={
                'db_table': 'student_college',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='ExternalCourse',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('code', models.CharField(max_length=20)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('professor_email', models.EmailField(max_length=254)),
                ('program_id', models.IntegerField()),
                ('year', models.PositiveIntegerField()),
                ('semester', models.PositiveIntegerField()),
            ],
            options={
                'db_table': 'student_course',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='ExternalCourseMark',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('student_id', models.IntegerField()),
                ('course_id', models.IntegerField()),
                ('assignment_score', models.FloatField()),
                ('midterm_score', models.FloatField()),
                ('final_score', models.FloatField()),
            ],
            options={
                'db_table': 'student_coursemark',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='ExternalDepartment',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('college_id', models.IntegerField()),
            ],
            options={
                'db_table': 'student_department',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='ExternalEnrollment',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('student_id', models.IntegerField()),
                ('course_id', models.IntegerField()),
            ],
            options={
                'db_table': 'student_enrollment',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='ExternalProfessor',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('user_email', models.EmailField(max_length=254, unique=True)),
                ('department', models.IntegerField(null=True)),
                ('designation', models.CharField(max_length=255)),
            ],
            options={
                'db_table': 'professor_professor',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='ExternalProgram',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('program_type', models.CharField(max_length=10)),
                ('duration_years', models.PositiveIntegerField()),
                ('department_id', models.IntegerField()),
            ],
            options={
                'db_table': 'student_program',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='ExternalStudent',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('user_email', models.EmailField(max_length=254, unique=True)),
                ('enrollment_year', models.PositiveIntegerField()),
                ('program_id', models.IntegerField()),
            ],
            options={
                'db_table': 'student_student',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='ExternalUser',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('first_name', models.CharField(max_length=255)),
                ('last_name', models.CharField(max_length=255)),
                ('role', models.CharField(max_length=20)),
                ('is_2fa_enabled', models.BooleanField(default=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('date_joined', models.DateTimeField()),
            ],
            options={
                'db_table': 'users_user',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='AdminAnnouncement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('message', models.TextField()),
                ('created_by', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('target_type', models.CharField(choices=[('all_users', 'All Users'), ('students', 'Students Only'), ('professors', 'Professors Only'), ('college', 'Specific College'), ('department', 'Specific Department'), ('program', 'Specific Program')], max_length=20)),
                ('target_id', models.IntegerField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='SystemSetting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(max_length=255, unique=True)),
                ('value', models.CharField(max_length=255)),
            ],
        ),
    ]
